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

  const filename = `${dataset}.step6-insert-records-${preset}.json`;
  const filePath = path.join(process.cwd(), "datasets_3mb", filename);

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    // Return metadata + first 3 records (with truncated dense vector)
    const records = data.records.slice(0, 3).map((r: Record<string, unknown>) => {
      const { dense, ...rest } = r;
      const denseArr = dense as number[];
      return {
        ...rest,
        dense: `[${denseArr.slice(0, 3).map((v: number) => v.toFixed(8)).join(",")},...] `,
        sparse: "BM25(text)",
      };
    });

    res.status(200).json({
      dataset: data.dataset,
      preset: data.preset,
      recordCount: data.record_count,
      sourceFile: filename,
      records,
    });
  } catch {
    res.status(404).json({ message: `Dataset file not found: ${filename}` });
  }
}
