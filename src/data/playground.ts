type DatasetId = "docs" | "legal" | "arxiv";
type ChunkPreset = "small" | "balanced" | "large";

// --- Types ---

export type ChunkData = {
  chunkSize: number;
  chunkOverlap: number;
  chunkCount: number;
  chunks: { text: string }[];
};

export type MetadataData = {
  metadataFields: string[];
  chunkCount: number;
  chunks: { text: string; meta: Record<string, unknown> }[];
};

export type EmbeddingData = {
  model: string;
  dimension: number;
  chunks: { id: string; displayText: string; embeddingFirst64: number[] }[];
};

export type InsertData = {
  recordCount: number;
  sourceFile: string;
  records: Record<string, unknown>[];
};

export type RetrievalQuestion = {
  id: string;
  query: string;
  variants: {
    label: string;
    filter: string | null;
    hits: { score: number; text: string; source: string; chunkId: number }[];
    answer: string;
    citations: string[];
  }[];
};

interface DatasetBundle {
  step1: { label: string; text: string }[];
  step2: Record<string, ChunkData>;
  step3: Record<string, MetadataData>;
  step4: EmbeddingData;
  step5: Record<string, InsertData>;
  step6: RetrievalQuestion[];
}

// --- In-memory cache ---

const cache = new Map<string, Promise<DatasetBundle>>();

function fetchDataset(datasetId: DatasetId): Promise<DatasetBundle> {
  const existing = cache.get(datasetId);
  if (existing) return existing;

  const promise = fetch(`/datasets/preview/${datasetId}.json`)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load dataset: ${res.status}`);
      return res.json() as Promise<DatasetBundle>;
    })
    .catch((err) => {
      cache.delete(datasetId); // allow retry on failure
      throw err;
    });

  cache.set(datasetId, promise);
  return promise;
}

// --- Preload (fire & forget) ---

export function preloadDataset(datasetId: DatasetId) {
  fetchDataset(datasetId);
}

// --- Async getters ---

export async function getDatasetPreview(datasetId: DatasetId) {
  const bundle = await fetchDataset(datasetId);
  return bundle.step1;
}

export async function getChunkPreview(datasetId: DatasetId, preset: ChunkPreset) {
  const bundle = await fetchDataset(datasetId);
  return bundle.step2[preset];
}

export async function getMetadataPreview(datasetId: DatasetId, preset: ChunkPreset) {
  const bundle = await fetchDataset(datasetId);
  return bundle.step3[preset];
}

export async function getEmbeddingPreview(datasetId: DatasetId) {
  const bundle = await fetchDataset(datasetId);
  return bundle.step4;
}

export async function getInsertPreview(datasetId: DatasetId, preset: ChunkPreset) {
  const bundle = await fetchDataset(datasetId);
  return bundle.step5[preset];
}

export async function getRetrievalData(datasetId: DatasetId) {
  const bundle = await fetchDataset(datasetId);
  return bundle.step6;
}
