import data from "./playgroundData.json";

type DatasetId = "docs" | "legal" | "arxiv";
type ChunkPreset = "small" | "balanced" | "large";

// Step 1: dataset preview
export function getDatasetPreview(datasetId: DatasetId) {
  return (data.step1 as Record<string, { label: string; text: string }[]>)[datasetId];
}

// Step 2: chunk preview
export function getChunkPreview(datasetId: DatasetId, preset: ChunkPreset) {
  return (data.step2 as Record<string, Record<string, {
    chunkSize: number;
    chunkOverlap: number;
    chunkCount: number;
    chunks: { text: string }[];
  }>>)[datasetId][preset];
}

// Step 3: metadata preview
export function getMetadataPreview(datasetId: DatasetId, preset: ChunkPreset) {
  return (data.step3 as Record<string, Record<string, {
    metadataFields: string[];
    chunkCount: number;
    chunks: { text: string; meta: Record<string, unknown> }[];
  }>>)[datasetId][preset];
}

// Step 4: embedding preview
export function getEmbeddingPreview(datasetId: DatasetId) {
  return (data.step4 as Record<string, {
    model: string;
    dimension: number;
    chunks: { id: string; displayText: string; embeddingFirst64: number[] }[];
  }>)[datasetId];
}

// Step 5: insert preview
export function getInsertPreview(datasetId: DatasetId, preset: ChunkPreset) {
  return (data.step5 as Record<string, Record<string, {
    recordCount: number;
    sourceFile: string;
    records: Record<string, unknown>[];
  }>>)[datasetId][preset];
}

// Step 6: retrieval questions & answers
export function getRetrievalData(datasetId: DatasetId) {
  return (data.step6 as Record<string, {
    id: string;
    query: string;
    variants: {
      label: string;
      filter: string | null;
      hits: { score: number; text: string; source: string; chunkId: number }[];
      answer: string;
      citations: string[];
    }[];
  }[]>)[datasetId];
}
