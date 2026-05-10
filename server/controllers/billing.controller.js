import { PLANS } from "../config/plan.js";
import stripe from "../config/stripe.js";
export const billing = async (req, res) => {
  try {
    const { planType } = req.body;
    const userId = req.user._id;
    const plan = PLANS[planType];
    if (!plan || plan.price === 0)
      return res.status(400).json({ message: "Invalid or free plan type" });
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Website Builder ${planType.toUpperCase()} plan`,
              description: `${plan.credits} AI Credits Included`,
            },
            unit_amount: plan.price * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId.toString(),
        credits: plan.credits.toString(),
        plan: plan.plan,
      },
      success_url: `${"http://localhost:5173/dashboard?payment=success"}`,
      cancel_url: `${"http://localhost:5173/pricing?canceled=true"}`,
    });
    return res.status(200).json({ success: true, sessionUrl: session.url });
  } catch (error) {
    return res.status(500).json({ error: `Billing error: ${error.message}` });
  }
};
