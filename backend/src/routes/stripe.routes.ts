import { Response } from "express";
import Stripe from "stripe";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { createSecureRouter, Permission } from "../middleware/permissions.middleware";

const router = createSecureRouter();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

const FRONTEND_URL = process.env.FRONTEND_URL ?? process.env.WEB_URL ?? "http://localhost:3000";

// The client selects a plan name, never a Stripe price. The actual price ID —
// and therefore the amount charged — is always looked up server-side so a
// client can't substitute an arbitrary/unintended Stripe price at checkout.
const PLAN_PRICE_IDS: Record<"LIVE_EVENT", string | undefined> = {
  LIVE_EVENT: process.env.STRIPE_PRICE_LIVE_EVENT,
};

const checkoutSchema = z.object({
  plan: z.enum(["LIVE_EVENT"]),
});

router.post("/create-checkout-session", Permission.auth(), async (req: AuthRequest, res: Response) => {
  const userId = req.auth?.sub;

  if (!userId) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const priceId = PLAN_PRICE_IDS[parsed.data.plan];
  if (!priceId) {
    res.status(500).json({ error: "Plan is not configured." });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, stripeCustomerId: true },
  });

  if (!user) {
    res.status(404).json({ error: "User not found." });
    return;
  }

  try {
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 30 },
      success_url: `${FRONTEND_URL}/dashboard/paywall/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/dashboard/paywall?canceled=1`,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        priceId,
      },
    });

    res.json({ url: session.url });
  } catch {
    res.status(500).json({ error: "Failed to create checkout session." });
  }
});

export default router;
