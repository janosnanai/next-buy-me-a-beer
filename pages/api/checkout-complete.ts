// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { buffer } from "micro";
import Stripe from "stripe";
import {
  AIRTABLE_API_KEY,
  AIRTABLE_APP_ID,
  STRIPE_API_KEY,
  STRIPE_WEBHOOK_SECRET,
} from "../../config";

const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: "2022-11-15" });

async function insertToAirTable({
  name,
  message,
  amount,
}: {
  name: string;
  message: string;
  amount: number;
}) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_APP_ID}/donations`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    },
    body: JSON.stringify({
      records: [
        {
          fields: {
            name,
            message,
            amount,
          },
        },
      ],
    }),
  });

  return response.json();
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method bot allowed." });
  }

  const signature = req.headers["stripe-signature"] as string;

  if (!signature) {
    return res.status(400).json({ message: "Missing signature" });
  }

  let event: Stripe.Event;
  const buf = await buffer(req);

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Invalid signature: " + err);
    return res.status(400).json({ message: "Invalid signature." });
  }

  if (event.type !== "checkout.session.completed") {
    return res.status(400).json({ message: "Invalid event type." });
  }

  const { amount_total, metadata } = event.data.object as {
    amount_total: number;
    metadata: { name: string; message: string };
  };

  const amount = amount_total / 100;

  await insertToAirTable({
    ...metadata,
    amount,
  });

  return res.status(200).json({ message: "Success." });
}
