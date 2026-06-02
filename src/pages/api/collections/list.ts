import type { NextApiRequest, NextApiResponse } from "next";
import { CollectionApi } from "@/http/collection";

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
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ message: "endpoint is required" });
    }
    const collectionApi = new CollectionApi(endpoint, apiKey);
    const result = await collectionApi.listCollections();
    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list collections";
    res.status(500).json({ message });
  }
}
