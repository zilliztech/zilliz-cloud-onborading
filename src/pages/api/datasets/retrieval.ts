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

  const filename = `${dataset}.step7-retrieval-mvp.json`;
  const filePath = path.join(process.cwd(), "datasets_3mb", filename);

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    const questions = data.questions.map(
      (q: {
        id: string;
        query: string;
        variants: {
          label: string;
          filter: string | null;
          hits: { score: number; display_text: string; source: string; chunk_id: number }[];
          answer: string;
          citations: string[];
        }[];
      }) => ({
        id: q.id,
        query: q.query,
        variants: q.variants.map((v) => ({
          label: v.label,
          filter: v.filter,
          hits: v.hits.map((h) => ({
            score: h.score,
            text: h.display_text,
            source: h.source,
            chunkId: h.chunk_id,
          })),
          answer: v.answer,
          citations: v.citations,
        })),
      })
    );

    res.status(200).json({ questions });
  } catch {
    res.status(404).json({ message: `File not found: ${filename}` });
  }
}
