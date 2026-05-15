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
import { sendAdminAlert, sendWelcomeEmail } from "@/lib/email";
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
    // Unknown price — almost always a missing/wrong STRIPE_PRICE_* env var.
    // Fail loud: a 500 keeps the event in Stripe's retry queue and shows it
    // as failed in the dashboard, instead of silently dropping a paid order.
    console.error(
      `[stripe-webhook] Unknown priceId ${priceId} for session ${session.id}.`,
    );
    await sendAdminAlert(
      "[Get Client Ready] Action needed: unrecognised Stripe price",
      {
        heading: "A paid order could not be provisioned.",
        lines: [
          `<strong>${email}</strong> completed checkout, but the Stripe price <code>${priceId}</code> is not mapped to any tier.`,
          "This usually means STRIPE_PRICE_SPRINT / SHIFT / REFRAME is missing or wrong.",
          "The customer has NOT received an account. Fix the env var, then replay this event from the Stripe dashboard (Developers → Webhooks).",
        ],
      },
    );
    return new Response(`Unrecognised price ${priceId}.`, { status: 500 });
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
  const { error: updateErr } = userId
    ? await admin.from("profiles").update({ tier }).eq("user_id", userId)
    : // User already existed — match by email to update their tier.
      await admin.from("profiles").update({ tier }).eq("email", email);

  if (updateErr) {
    // The customer paid but their profile still shows the default tier.
    // Alert + 500 so Stripe retries and the failure is visible.
    console.error(
      `[stripe-webhook] Failed to set tier=${tier} for ${email}: ${updateErr.message}`,
    );
    await sendAdminAlert(
      "[Get Client Ready] Action needed: tier not applied",
      {
        heading: "A paid account is on the wrong tier.",
        lines: [
          `<strong>${email}</strong> paid for the <strong>${tier}</strong> tier, but updating their profile failed.`,
          `Error: <code>${updateErr.message}</code>`,
          `The account exists but may still show the default tier. Set tier=${tier} in Supabase manually, or replay the event from the Stripe dashboard.`,
        ],
      },
    );
    return new Response(`Tier update failed: ${updateErr.message}`, {
      status: 500,
    });
  }

  // Best-effort welcome email. Skipped silently if Resend not configured.
  const welcome = await sendWelcomeEmail({
    to: email,
    studentFirstName: firstName || "there",
  });

  // Notify the admin of every paid signup, flagging if the buyer's login
  // email did not go out (in which case they need a manual follow-up).
  const welcomeStatus = welcome.ok
    ? "Welcome email sent."
    : welcome.skipped
      ? "Welcome email SKIPPED — Resend is not configured. The customer has no login link yet; contact them manually."
      : `Welcome email FAILED: ${welcome.error ?? "unknown error"}. The customer has no login link yet; contact them manually.`;

  await sendAdminAlert(`[Get Client Ready] New ${tier} signup: ${email}`, {
    heading: "New paid signup.",
    lines: [
      `<strong>${email}</strong>${fullName ? ` (${fullName})` : ""} purchased the <strong>${tier}</strong> tier.`,
      welcomeStatus,
    ],
  });

  return Response.json({ received: true, tier, email });
}
