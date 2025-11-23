const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, name } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 50000,
      currency: 'cad',
      capture_method: 'manual',
      description: 'Security Deposit 500$ AIRBNB',
      receipt_email: email,
      metadata: {
        customer_name: name,
        type: 'security_deposit'
      },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
}