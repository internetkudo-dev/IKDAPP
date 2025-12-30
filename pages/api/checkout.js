import Stripe from "stripe";

// NEVER hard-code your secret key here. Put it in .env.local as STRIPE_SECRET_KEY.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16"
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { packageId, name, price, currency = "eur" } = req.body || {};

    if (!packageId || !name || !price) {
      return res.status(400).json({ error: "Missing package data" });
    }

    // Convert price string/number to minor units (e.g. cents)
    const normalized =
      typeof price === "number"
        ? price.toString()
        : String(price).trim();

    // Remove currency symbols and spaces, keep digits, dots, commas
    const numericString = normalized
      .replace(/[^\d.,]/g, "")
      .replace(",", ".");

    const amountFloat = parseFloat(numericString);
    if (!Number.isFinite(amountFloat) || amountFloat <= 0) {
      return res.status(400).json({ error: "Invalid price value" });
    }

    const amountInMinor = Math.round(amountFloat * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name
            },
            unit_amount: amountInMinor
          },
          quantity: 1
        }
      ],
      metadata: {
        packageId
      },
      success_url: `${req.headers.origin}/?success=true`,
      cancel_url: `${req.headers.origin}/?canceled=true`
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Stripe checkout error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}


