import stripe from "../config/stripe.js";
import User from "../models/user.model.js";

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(500).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const credits = Number(session.metadata.credits);
    const plan = session.metadata.plan;
    await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { credits: credits }, $set: { plan: plan } },
    );
    return res.status(200).send("Payment succeeded:", session);
    console.log("Payment succeeded:", session);
  } else {
    console.log(`Unhandled event type ${event.type}`);
  }
};
