// Stripe → Supabase auto-provisioning webhook.
//
// Stripe sends `checkout.session.completed` after a successful Payment Link
// purchase. This handler:
//   1. Verifies the Stripe signature with STRIPE_WEBHOOK_SECRET.
//   2. Looks up the customer email + the price the customer paid for.
//   3. Maps the price ID → internal tier (sprint | shift | reframe).
//   4. Calls Supabase Admin → inviteUserByEmail (creates auth.users row;
//      the on_auth_user_created trigger creates the matching profile row).
//   5. Updates profiles.tier to the purchased tier.
//   6. Sends the welcome email via Resend (best-effort).
//
// Idempotency: Stripe retries delivery on non-2xx. We treat duplicate
// invites as success (inviteUserByEmail surfaces the existing user).

import type { NextRequest } from "next/server";
import type Stripe from "stripe";

import {
  STRIPE_PRICE_TO_TIER,
  STRIPE_WEBHOOK_SECRET,
} from "@/lib/env";
import { sendWelcomeEmail } from "@/lib/email";
import { getStripe } from "@/lib/stripe";
import { getAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing Stripe signature.", { status: 400 });
  }
  if (!STRIPE_WEBHOOK_SECRET) {
    return new Response("Webhook secret not configured.", { status: 500 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(
      rawBody,
      signature,
      STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return new Response(`Signature verification failed: ${msg}`, {
      status: 400,
    });
  }

  if (event.type !== "checkout.session.completed") {
    // We only care about successful checkouts. Ignore everything else
    // but still 200 OK so Stripe stops retrying.
    return Response.json({ received: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const email = session.customer_details?.email ?? session.customer_email;
  if (!email) {
    return new Response("Missing customer email on session.", { status: 400 });
  }

  // Fetch the line items to find the price the customer paid for.
  const stripe = getStripe();
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 1,
  });
  const priceId = lineItems.data[0]?.price?.id;
  if (!priceId) {
    return new Response("No line items on session.", { status: 400 });
  }

  const tier = STRIPE_PRICE_TO_TIER[priceId];
  if (!tier) {
    // Unknown price — likely env vars not configured. Still 200 so Stripe
    // doesn't retry forever, but log so it surfaces in Vercel logs.
    console.error(
      `[stripe-webhook] Unknown priceId ${priceId} for session ${session.id}.`,
    );
    return Response.json({ received: true, ignored: "unknown_price" });
  }

  // Extract name from customer details for friendlier welcome email.
  const fullName = session.customer_details?.name ?? "";
  const [firstName = "", ...rest] = fullName.split(" ");
  const lastName = rest.join(" ");

  const admin = getAdminClient();

  // Create / invite the Auth user. inviteUserByEmail sends a magic-link
  // email from Supabase that lets the buyer set their password.
  const { data: invited, error: inviteErr } =
    await admin.auth.admin.inviteUserByEmail(email, {
      data: { first_name: firstName, last_name: lastName, tier },
    });

  if (inviteErr && !/already.*registered/i.test(inviteErr.message)) {
    return new Response(`Invite failed: ${inviteErr.message}`, { status: 500 });
  }

  // Whether newly invited or existing, update profile tier to match the
  // purchased product. The on_auth_user_created trigger creates the
  // profile row with default tier='sprint'; we overwrite to the real tier.
  const userId = invited?.user?.id;
  if (userId) {
    const { error: updateErr } = await admin
      .from("profiles")
      .update({ tier })
      .eq("user_id", userId);
    if (updateErr) {
      console.error(
        `[stripe-webhook] Failed to update tier for ${userId}: ${updateErr.message}`,
      );
    }
  } else {
    // User already existed — match by email to update their tier.
    const { error: updateErr } = await admin
      .from("profiles")
      .update({ tier })
      .eq("email", email);
    if (updateErr) {
      console.error(
        `[stripe-webhook] Failed to update tier for ${email}: ${updateErr.message}`,
      );
    }
  }

  // Best-effort welcome email. Skipped silently if Resend not configured.
  await sendWelcomeEmail({
    to: email,
    studentFirstName: firstName || "there",
  });

  return Response.json({ received: true, tier, email });
}
