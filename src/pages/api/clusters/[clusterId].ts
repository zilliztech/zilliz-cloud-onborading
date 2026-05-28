import type { NextApiRequest, NextApiResponse } from "next";
import { ClusterApi } from "@/http";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const apiKey = req.headers.authorization?.replace("Bearer ", "");
  if (!apiKey) {
    return res.status(401).json({ message: "API key is required" });
  }

  try {
    const { clusterId } = req.query;
    const clusterApi = new ClusterApi(apiKey);
    const result = await clusterApi.describeCluster(clusterId as string);
    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to describe cluster";
    res.status(500).json({ message });
  }
}
