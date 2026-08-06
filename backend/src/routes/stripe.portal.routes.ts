import { Response } from "express";
import Stripe from "stripe";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { createSecureRouter, Permission } from "../middleware/permissions.middleware";

const router = createSecureRouter();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

const FRONTEND_URL = process.env.FRONTEND_URL ?? process.env.WEB_URL ?? "http://localhost:3000";

router.post(
  "/create-customer-portal-session",
  Permission.auth(),
  async (req: AuthRequest, res: Response) => {
    const userId = req.auth?.sub;

    if (!userId) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      res.status(400).json({ error: "No Stripe customer found for this account." });
      return;
    }

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${FRONTEND_URL}/dashboard/paywall`,
      });

      res.json({ url: session.url });
    } catch {
      res.status(500).json({ error: "Failed to create customer portal session." });
    }
  }
);

export default router;
