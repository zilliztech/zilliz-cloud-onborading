import type { NextApiRequest, NextApiResponse } from "next";
import {
  CollectionApi,
  ONBOARDING_SCHEMA,
  ONBOARDING_INDEX_PARAMS,
} from "@/http/collection";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const apiKey = req.headers.authorization?.replace("Bearer ", "");
  if (!apiKey) {
    return res.status(401).json({ message: "API key is required" });
  }

  try {
    const { endpoint, collectionName } = req.body;
    const collectionApi = new CollectionApi(endpoint, apiKey);
    const payload = {
      collectionName,
      schema: ONBOARDING_SCHEMA,
      indexParams: ONBOARDING_INDEX_PARAMS,
    };
    console.log("[create-collection] payload:", JSON.stringify(payload, null, 2));
    const result = await collectionApi.createCollection(payload);
    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create collection";
    res.status(500).json({ message });
  }
}
