import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { dataset } = req.query;
  const validDatasets = ["enterprise_docs", "legal_contracts", "arxiv_papers"];

  if (!dataset || !validDatasets.includes(dataset as string)) {
    return res.status(400).json({ message: "Invalid dataset" });
  }

  const filename = `${dataset}.step5-chunk-embeddings.json`;
  const filePath = path.join(process.cwd(), "datasets_3mb", filename);

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    res.status(200).json({
      model: data.chunks[0]?.model ?? "text-embedding-3-small",
      dimension: data.chunks[0]?.dimension ?? 1536,
      chunks: data.chunks.map(
        (c: {
          id: string;
          display_text: string;
          model: string;
          dimension: number;
          embedding_first_64: number[];
          metadata: Record<string, unknown>;
        }) => ({
          id: c.id,
          displayText: c.display_text,
          model: c.model,
          dimension: c.dimension,
          embeddingFirst64: c.embedding_first_64,
          metadata: c.metadata,
        })
      ),
    });
  } catch {
    res.status(404).json({ message: `Dataset file not found: ${filename}` });
  }
}
