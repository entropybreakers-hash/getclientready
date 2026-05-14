// Server-only Stripe client. Only ever imported by route handlers.

import "server-only";

import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "./env";

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (!STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  if (cached) return cached;
  cached = new Stripe(STRIPE_SECRET_KEY);
  return cached;
}
