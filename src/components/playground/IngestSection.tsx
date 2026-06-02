import { useState } from "react";
import { StepProgress } from "./StepProgress";
import { CodeBlock } from "./CodeBlock";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";
import { Tag } from "@/components/ui/Tag";
import type { DatasetId, ChunkPreset } from "@/pages/playground";
import { StepNavButtons } from "./StepNavButtons";
import { DATASET_FILE_MAP, DATASET_LABELS } from "@/pages/playground";
import { getInsertPreview } from "@/data/playground";
import { usePlaygroundData } from "@/hooks/usePlaygroundData";

import { Button } from "@/components/ui/Button";

interface IngestSectionProps {
  datasetId: DatasetId;
  preset: ChunkPreset;
  apiKey: string;
  clusterEndpoint: string;
  collectionName: string;
  canInsert: boolean;
  onInsertComplete: () => void;
  onNext: () => void;
}

interface QueryRecord {
  id: number;
  text: string;
  source: string;
  chunk_id: number;
  visibility: string;
  [key: string]: unknown;
}

export function IngestSection({
  datasetId,
  preset,
  apiKey,
  clusterEndpoint,
  collectionName,
  canInsert,
  onInsertComplete,
  onNext,
}: IngestSectionProps) {
  const [inserting, setInserting] = useState(false);
  const [inserted, setInserted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [queryResults, setQueryResults] = useState<QueryRecord[] | null>(null);

  const datasetFile = DATASET_FILE_MAP[datasetId];
  const datasetLabel = DATASET_LABELS[datasetId];
  const { data, loading } = usePlaygroundData(
    () => getInsertPreview(datasetId, preset),
    [datasetId, preset],
  );

  if (loading || !data) {
    return (
      <section id="step-ingest" className="animate-[rise_500ms_cubic-bezier(.2,.7,.2,1)_both]">
        <div className="flex items-center justify-center rounded-xl border border-[rgba(22,26,35,0.06)] bg-white p-12 shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
          <span className="text-[13px] text-[#8592a8]">Loading insert preview...</span>
        </div>
      </section>
    );
  }

  const handleInsert = async () => {
    setInserting(true);
    setProgress(0);
    setError(null);

    // Simulate progress while inserting
    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 8 + 2, 90));
    }, 500);

    try {
      const res = await fetch("/api/datasets/insert", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: clusterEndpoint,
          collectionName,
          dataset: datasetFile,
          preset,
        }),
      });

      clearInterval(progressTimer);
      const result = await res.json();

      if (!res.ok || (result.message && !result.data)) {
        throw new Error(result.message || "Insert failed");
      }

      setProgress(100);
      setInserted(true);
      setInserting(false);
      onInsertComplete();

      // Query first 5 records to show
      const queryRes = await fetch("/api/datasets/query", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: clusterEndpoint,
          collectionName,
          limit: 5,
        }),
      });

      const queryData = await queryRes.json();
      if (queryData.data) {
        setQueryResults(queryData.data);
      }
    } catch (err) {
      clearInterval(progressTimer);
      setInserting(false);
      setError(err instanceof Error ? err.message : "Insert failed");
    }
  };

  const previewColumns = data.records[0] ? Object.keys(data.records[0]) : [];

  const codeSnippet = `from pymilvus import MilvusClient, DataType, Function, FunctionType

# Cluster created in init step
client = MilvusClient(uri=ZILLIZ_URI, token=ZILLIZ_TOKEN)

schema = client.create_schema()
schema.add_field("id", DataType.INT64, is_primary=True)
schema.add_field("text", DataType.VARCHAR, max_length=8192, enable_analyzer=True)
schema.add_field("source", DataType.VARCHAR, max_length=256)
schema.add_field("chunk_id", DataType.INT64)
schema.add_field("visibility", DataType.VARCHAR, max_length=64)
schema.add_field("dense", DataType.FLOAT_VECTOR, dim=1536)
schema.add_field("sparse", DataType.SPARSE_FLOAT_VECTOR)
schema.enable_dynamic_field = True
schema.add_function(Function(
    name="text_bm25",
    input_field_names=["text"],
    output_field_names=["sparse"],
    function_type=FunctionType.BM25,
))

index_params = client.prepare_index_params()
index_params.add_index(field_name="dense", index_type="AUTOINDEX", metric_type="COSINE")
index_params.add_index(field_name="sparse", index_type="AUTOINDEX", metric_type="BM25")

client.create_collection(
    collection_name="${datasetFile}",
    schema=schema,
    index_params=index_params,
)
client.insert("${datasetFile}", data=records)`;

  return (
    <section id="step-ingest" className="animate-[rise_500ms_cubic-bezier(.2,.7,.2,1)_both]">
      {/* Header */}
      <div className="rounded-xl border border-[rgba(22,26,35,0.06)] bg-white p-5 shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-blue-1">Step 5 of 7</span>
          <span className="h-1 w-1 rounded-full bg-[#b0bac9]" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#8592a8]">Insert</span>
        </div>
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-[#0a0d14]">
          Create Collection & ingest into Zilliz Cloud
        </h1>
        <p className="mt-0.5 text-[14px] text-[#64718a]">
          Build the collection with Hybrid Search (dense + sparse) — AUTOINDEX handles indexing automatically
          <a
            href="https://docs.zilliz.com/docs/insert-update-delete"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-[3px] whitespace-nowrap text-[11.5px] font-medium text-blue-1 no-underline hover:text-blue-dark-1 hover:underline hover:[text-underline-offset:3px]"
          >
            Insert docs
            <ArrowRightIcon size={12} />
          </a>
        </p>
        <StepProgress currentStep={4} />
      </div>

      {/* Content grid */}
      <div className="mt-6 grid grid-cols-12 gap-6">
        {/* LEFT: Data preview + insert */}
        <div className="col-span-12 lg:col-span-6">
          <div className="overflow-hidden rounded-xl border border-[rgba(22,26,35,0.06)] bg-white shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[rgba(22,26,35,0.06)] px-5 py-3.5">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-blue-1">
                  <path d="M4 5.5C4 3.6 6.7 2 10 2s6 1.6 6 3.5v9C16 16.4 13.3 18 10 18s-6-1.6-6-3.5v-9z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <path d="M4 5.5C4 7.4 6.7 9 10 9s6-1.6 6-3.5M4 10c0 1.9 2.7 3.5 6 3.5s6-1.6 6-3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
                <span className="text-[13px] font-medium">Ready to insert into Zilliz</span>
              </div>
              <span className="font-mono text-[11px] text-[#8592a8]">
                <span className="text-[#3d4659]">{data.recordCount.toLocaleString()}</span> records
              </span>
            </div>

            {/* Collection info + Insert button */}
            <div className="border-b border-[rgba(22,26,35,0.06)] bg-[rgba(246,247,249,0.4)] px-5 py-3">
              <div className="mb-2.5 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] text-[#64718a]">Collection</div>
                  <div className="mt-0.5 font-mono text-[12.5px] text-[#161a23]">{collectionName}</div>
                </div>
                <Button
                  variant={inserted ? "success" : error ? "danger" : "primary"}
                  size="small"
                  loading={inserting}
                  disabled={!canInsert || inserting || inserted}
                  onClick={handleInsert}
                >
                  {inserted ? "✓ Inserted" : error ? "Failed" : !canInsert ? "Complete steps 2-4 first" : "Insert"}
                </Button>
              </div>
              <div className="rounded-lg border border-[rgba(22,26,35,0.06)] bg-white px-3 py-2">
                <div className="font-mono text-[10.5px] text-[#8592a8]">Source</div>
                <div className="mt-0.5 truncate font-mono text-[11.5px] text-[#3d4659]">{data.sourceFile}</div>
              </div>
              <div className="mt-2 font-mono text-[11px] text-[#8592a8]">
                {inserted ? "All records inserted successfully." : "Preview first 3 rows. Click Insert to write all records."}
              </div>
            </div>

            {/* Data table — show preview or query results */}
            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 332 }}>
              {!queryResults ? (
                <table className="w-full min-w-[900px] text-left">
                  <thead className="border-b border-[rgba(22,26,35,0.06)] bg-white">
                    <tr className="font-mono text-[11px] text-[#64718a]">
                      {previewColumns.map((col) => (
                        <th key={col} className="whitespace-nowrap px-3 py-3 font-medium">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(22,26,35,0.06)] text-[12px] text-[#3d4659]">
                    {data.records.map((row, i) => (
                      <tr key={i} className="transition hover:bg-[rgba(239,249,255,0.3)]">
                        {previewColumns.map((col) => (
                          <td key={col} className="max-w-[260px] truncate whitespace-nowrap px-3 py-3 font-mono text-[11.5px]">
                            {col === "visibility" ? (
                              <Tag label={String(row[col])} variant="success" size="xs" />
                            ) : col === "sparse" ? (
                              <span className="text-blue-1">{String(row[col])}</span>
                            ) : (
                              String(row[col] ?? "")
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div>
                  <div className="border-b border-[rgba(22,26,35,0.06)] bg-blue-5 px-5 py-2">
                    <span className="font-mono text-[11px] text-blue-1">✓ Showing first {queryResults.length} records from collection</span>
                  </div>
                  <table className="w-full min-w-[1000px] text-left">
                    <thead className="sticky top-0 z-10 border-b border-[rgba(22,26,35,0.06)] bg-white">
                      <tr className="font-mono text-[11px] text-[#64718a]">
                        <th className="px-3 py-3 font-medium">id</th>
                        <th className="min-w-[250px] px-3 py-3 font-medium">text</th>
                        <th className="px-3 py-3 font-medium">source</th>
                        <th className="px-3 py-3 font-medium">chunk_id</th>
                        <th className="px-3 py-3 font-medium">visibility</th>
                        <th className="min-w-[200px] px-3 py-3 font-medium">dense</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(22,26,35,0.06)] text-[12px] text-[#3d4659]">
                      {queryResults.map((row) => (
                        <tr key={row.id} className="transition hover:bg-[rgba(239,249,255,0.3)]">
                          <td className="whitespace-nowrap px-3 py-3 font-mono text-[11.5px]">{row.id}</td>
                          <td className="max-w-[300px] truncate px-3 py-3 text-[11.5px]">{typeof row.text === "string" ? (row.text.length > 80 ? row.text.slice(0, 80) + "..." : row.text) : ""}</td>
                          <td className="whitespace-nowrap px-3 py-3 font-mono text-[11.5px]">{row.source}</td>
                          <td className="whitespace-nowrap px-3 py-3 font-mono text-[11.5px]">{row.chunk_id}</td>
                          <td className="px-3 py-3"><Tag label={row.visibility} variant="success" size="xs" /></td>
                          <td className="max-w-[200px] truncate px-3 py-3 font-mono text-[10px] text-[#8592a8]">[{String(row.dense ?? "").slice(0, 40)}...]</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Progress + stats footer */}
            <div className="border-t border-[rgba(22,26,35,0.06)] bg-[rgba(246,247,249,0.4)] px-5 py-4">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="flex items-center gap-2 text-[12.5px] font-medium text-[#3d4659]">
                  <span className={`h-2 w-2 rounded-full ${inserted ? "bg-[#10b981]" : error ? "bg-[#ef4444]" : "bg-[#1493dc]"}`} />
                  {inserted ? "Insert complete" : inserting ? "Inserting records..." : error ? "Insert failed" : "Waiting to execute insert()"}
                </span>
                <span className="font-mono text-[13px] font-semibold text-blue-1">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#eceff3]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${inserted ? "bg-[#10b981]" : error ? "bg-[#ef4444]" : "bg-[#1493dc]"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {error && (
                <div className="mt-2 font-mono text-[11px] text-[#ef4444]">{error}</div>
              )}
              <div className="mt-3 grid grid-cols-3 gap-3 font-mono text-[11px]">
                <div>
                  <span className="text-[#8592a8]">Rows</span>
                  <div className="mt-0.5 text-[13px] font-semibold text-[#161a23]">{data.recordCount.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[#8592a8]">Index</span>
                  <div className="mt-0.5 text-[13px] font-semibold text-[#161a23]">AUTOINDEX</div>
                </div>
                <div>
                  <span className="text-[#8592a8]">Vector</span>
                  <div className="mt-0.5 text-[13px] font-semibold text-[#161a23]">dense + sparse</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Concept + Code */}
        <div className="col-span-12 lg:col-span-6">
          <div className="flex h-full flex-col space-y-5">
            {/* Concept card */}
            <div className="rounded-xl border border-[rgba(22,26,35,0.06)] bg-white p-5 shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
              <div className="mb-3">
                <span className="font-mono text-[11px] uppercase tracking-widest text-blue-1">Concept</span>
              </div>
              <h2 className="text-[20px] font-semibold leading-snug tracking-tight">
                Collection — the &quot;table&quot; of a vector database
              </h2>
              <p className="mt-3 text-[14.5px] leading-[1.75] text-[#4d5870]">
                A collection maps to one RAG app&apos;s datastore. When creating a collection, you define the{" "}
                <span className="font-medium text-[#161a23]">schema</span> (fields + vector dimensions) and{" "}
                <span className="font-medium text-[#161a23]">index</span>. Zilliz Cloud uses AUTOINDEX to
                automatically pick the optimal index — no need to understand HNSW / IVF internals.
              </p>
            </div>

            {/* Code block */}
            <div className="flex-1">
              <CodeBlock filename="insert.py" code={codeSnippet} />
            </div>
          </div>
        </div>
      </div>

      <StepNavButtons prevLabel="Previous" prevAnchor="#step-vector" nextLabel="Next: Search" onNext={onNext} />
    </section>
  );
}
