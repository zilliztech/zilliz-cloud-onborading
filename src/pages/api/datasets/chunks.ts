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

  const { dataset, preset } = req.query;

  const validDatasets = ["enterprise_docs", "legal_contracts", "arxiv_papers"];
  const validPresets = ["small", "balanced", "large"];

  if (
    !dataset ||
    !preset ||
    !validDatasets.includes(dataset as string) ||
    !validPresets.includes(preset as string)
  ) {
    return res.status(400).json({ message: "Invalid dataset or preset" });
  }

  const filename = `${dataset}.step3-chunks-${preset}.json`;
  const filePath = path.join(process.cwd(), "datasets_3mb", filename);

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    res.status(200).json({
      dataset: data.dataset,
      preset: data.preset,
      chunkSize: data.chunk_size,
      chunkOverlap: data.chunk_overlap,
      chunkCount: data.chunk_count,
      sourceFile: data.source_file,
      // Return first 4 chunks for preview (small preset shows 4)
      chunks: data.chunks.slice(0, 4).map((c: Record<string, unknown>) => ({
        text: c.text,
        source: c.source,
        chunkId: c.chunk_id,
      })),
    });
  } catch {
    res.status(404).json({ message: `Dataset file not found: ${filename}` });
  }
}
