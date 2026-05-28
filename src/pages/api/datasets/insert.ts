import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { ZillizClient } from "@/http/client";

const BATCH_SIZE = 100;

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

  const { endpoint, collectionName, dataset, preset } = req.body;

  const validDatasets = ["enterprise_docs", "legal_contracts", "arxiv_papers"];
  const validPresets = ["small", "balanced", "large"];

  if (
    !endpoint ||
    !collectionName ||
    !validDatasets.includes(dataset) ||
    !validPresets.includes(preset)
  ) {
    return res.status(400).json({ message: "Invalid parameters" });
  }

  const filename = `${dataset}.step6-insert-records-${preset}.json`;
  const filePath = path.join(process.cwd(), "datasets_3mb", filename);

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    const records: Record<string, unknown>[] = data.records;

    const client = new ZillizClient(endpoint, apiKey);

    let inserted = 0;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      await client.post("/v2/vectordb/entities/insert", {
        collectionName,
        data: batch,
      });
      inserted += batch.length;
    }

    res.status(200).json({
      code: 0,
      data: { insertedCount: inserted, totalRecords: records.length },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to insert records";
    res.status(500).json({ message });
  }
}

export const config = {
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};
