// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import type { AirtableRecord } from "../../types";

import { AIRTABLE_API_KEY, AIRTABLE_APP_ID } from "../../config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method bot allowed." });
  }

  const maxRecords = 3;

  const url = `https://api.airtable.com/v0/${AIRTABLE_APP_ID}/donations?maxRecords=${maxRecords}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    },
  });

  const data = (await response.json()) as AirtableRecord;

  return res.status(200).json(data.records);
}
