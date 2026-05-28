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

    // Return metadata fields and first 4 chunks with full metadata
    const chunks = data.chunks.slice(0, 4).map((c: Record<string, unknown>) => {
      const { text, ...meta } = c;
      return {
        text: (text as string).length > 120 ? (text as string).slice(0, 120) + "..." : text,
        meta,
      };
    });

    res.status(200).json({
      metadataFields: data.metadata_fields,
      chunkCount: data.chunk_count,
      chunks,
    });
  } catch {
    res.status(404).json({ message: `Dataset file not found: ${filename}` });
  }
}
