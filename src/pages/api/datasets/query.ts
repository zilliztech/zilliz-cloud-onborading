import type { NextApiRequest, NextApiResponse } from "next";
import { ZillizClient } from "@/http/client";

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

  const { endpoint, collectionName, limit = 5 } = req.body;

  if (!endpoint || !collectionName) {
    return res.status(400).json({ message: "Invalid parameters" });
  }

  try {
    const client = new ZillizClient(endpoint, apiKey);
    const result = await client.post("/v2/vectordb/entities/query", {
      collectionName,
      filter: "",
      limit,
      outputFields: ["id", "text", "source", "chunk_id", "visibility", "dense"],
    });

    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to query records";
    res.status(500).json({ message });
  }
}
