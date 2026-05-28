import { useEffect, useState } from "react";
import { StepProgress } from "./StepProgress";
import { CodeBlock } from "./CodeBlock";
import { ArrowRightIcon, ArrowLeftIcon } from "@/components/icons/ArrowRightIcon";
import type { DatasetId } from "@/pages/playground";
import { StepNavButtons } from "./StepNavButtons";
import { DATASET_FILE_MAP } from "@/pages/playground";

interface VectorSectionProps {
  datasetId: DatasetId;
  onNext: () => void;
}

interface EmbeddingChunk {
  id: string;
  displayText: string;
  model: string;
  dimension: number;
  embeddingFirst64: number[];
  metadata: Record<string, unknown>;
}

interface EmbeddingData {
  model: string;
  dimension: number;
  chunks: EmbeddingChunk[];
}

function valueToColor(v: number): string {
  // Map [-0.1, 0.1] to hue 240 (blue/neg) → 0 (red/pos)
  const clamped = Math.max(-0.1, Math.min(0.1, v));
  const t = (clamped + 0.1) / 0.2; // 0..1
  const r = Math.round(t * 255);
  const b = Math.round((1 - t) * 255);
  const g = Math.round(Math.min(t, 1 - t) * 2 * 120);
  return `rgb(${r},${g},${b})`;
}

export function VectorSection({ datasetId, onNext }: VectorSectionProps) {
  const [data, setData] = useState<EmbeddingData | null>(null);
  const [selectedChunk, setSelectedChunk] = useState(0);
  const [computed, setComputed] = useState(false);

  const datasetFile = DATASET_FILE_MAP[datasetId];

  useEffect(() => {
    let stale = false;
    fetch(`/api/datasets/embeddings?dataset=${datasetFile}`)
      .then((res) => res.json())
      .then((d) => {
        if (!stale) {
          setData(d);
          setSelectedChunk(0);
          setComputed(false);
        }
      });
    return () => { stale = true; };
  }, [datasetFile]);

  const chunk = data?.chunks[selectedChunk];

  const codeSnippet = `from openai import OpenAI
import os

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
texts = [r["text"] for r in records]
vectors = []
for start in range(0, len(texts), 100):
    batch = texts[start:start + 100]
    resp = client.embeddings.create(
        model="${data?.model ?? "text-embedding-3-small"}",
        input=batch,
    )
    vectors.extend([d.embedding for d in resp.data])

for record, vector in zip(records, vectors):
    record["dense"] = vector`;

  return (
    <section id="step-vector" className="animate-[rise_500ms_cubic-bezier(.2,.7,.2,1)_both]">
      {/* Header */}
      <div className="rounded-xl border border-[rgba(22,26,35,0.06)] bg-white p-5 shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-blue-1">Step 4 of 7</span>
          <span className="h-1 w-1 rounded-full bg-[#b0bac9]" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#8592a8]">Embedding</span>
        </div>
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-[#0a0d14]">
          Generate vectors
        </h1>
        <p className="mt-0.5 text-[14px] text-[#64718a]">
          Turn text into high-dimensional vectors — this step shows how embeddings encode semantics into searchable numbers
          <a
            href="https://docs.zilliz.com/docs/model-based-functions"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-[3px] whitespace-nowrap text-[11.5px] font-medium text-blue-1 no-underline hover:text-blue-dark-1 hover:underline hover:[text-underline-offset:3px]"
          >
            Model functions docs
            <ArrowRightIcon size={12} />
          </a>
        </p>
        <StepProgress currentStep={3} />
      </div>

      {/* Content grid */}
      <div className="mt-6 grid grid-cols-12 gap-6">
        {/* LEFT: Vector visualization */}
        <div className="col-span-12 lg:col-span-6">
          <div className="overflow-hidden rounded-xl border border-[rgba(22,26,35,0.06)] bg-white shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[rgba(22,26,35,0.06)] px-5 py-3.5">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-blue-1">
                  <rect x="2" y="6" width="3" height="10" rx="0.5" fill="currentColor" opacity="0.3" />
                  <rect x="6" y="3" width="3" height="13" rx="0.5" fill="currentColor" opacity="0.6" />
                  <rect x="10" y="8" width="3" height="8" rx="0.5" fill="currentColor" opacity="0.4" />
                  <rect x="14" y="2" width="3" height="14" rx="0.5" fill="currentColor" />
                </svg>
                <span className="text-[13px] font-medium">Vector visualization</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#64718a]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                {data?.dimension ?? 1536} dims
              </div>
            </div>

            <div className="space-y-4 p-5">
              {/* Chunk selection */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-[12px] text-[#64718a]">Select a chunk</div>
                  <div className="font-mono text-[10.5px] text-[#8592a8]">
                    {datasetFile}.step5-chunk-embeddings.json
                  </div>
                </div>
                <div className="grid gap-2">
                  {data?.chunks.map((c, i) => {
                    const isActive = i === selectedChunk;
                    return (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedChunk(i); setComputed(false); }}
                        className={`group cursor-pointer rounded-[12px] p-[1.5px] text-left transition-all ${
                          isActive
                            ? "bg-gradient-to-l from-[#FF058A] via-[#B92BBA] to-[#531AEE]"
                            : "bg-stroke-1 hover:bg-[linear-gradient(270deg,#FF058A,#B92BBA,#531AEE)]"
                        }`}
                      >
                        <div className="flex items-start gap-2 rounded-[10.5px] bg-white px-3 py-2.5">
                          <span className={`mt-0.5 font-mono text-[10px] ${isActive ? "text-blue-1" : "text-[#8592a8]"}`}>
                            {c.id.toUpperCase()}
                          </span>
                          <span className={`text-[12.5px] leading-snug ${isActive ? "font-medium text-[#161a23]" : "text-[#3d4659]"}`}>
                            {c.displayText.length > 120 ? c.displayText.slice(0, 120) + "..." : c.displayText}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Compute action */}
              <div className="flex items-center justify-between gap-3 rounded-lg border border-[rgba(22,26,35,0.06)] bg-[rgba(246,247,249,0.5)] p-3">
                <div>
                  <div className="text-[12.5px] font-medium text-[#2c3343]">Compute embedding</div>
                  <div className="mt-0.5 font-mono text-[11px] text-[#8592a8]">
                    {computed ? "Embedding generated" : "Waiting to generate vector for chunk text"}
                  </div>
                </div>
                <button
                  onClick={() => setComputed(true)}
                  disabled={computed}
                  className={`shrink-0 cursor-pointer rounded-lg px-4 py-2 text-[12px] font-semibold text-white transition-all ${
                    computed ? "bg-[#10b981]" : "bg-blue-1 hover:bg-blue-dark-1"
                  }`}
                >
                  {computed ? "✓ Computed" : "Compute embedding"}
                </button>
              </div>

              {/* Heatmap visualization */}
              <div className="pt-2">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[12px] font-medium text-[#3d4659]">Embedding (first 64 dims)</span>
                  <span className="font-mono text-[10.5px] text-[#8592a8]">{data?.model ?? "text-embedding-3-small"}</span>
                </div>

                {!computed && (
                  <div className="rounded-lg border border-dashed border-[rgba(22,26,35,0.06)] bg-white px-4 py-6 text-center text-[12.5px] text-[#8592a8]">
                    Click the button above to generate the vector
                  </div>
                )}

                {computed && chunk && (
                  <>
                    {/* Heatmap strip */}
                    <div className="rounded-lg bg-[#0a0d14] p-2.5">
                      <div className="grid gap-[2px]" style={{ gridTemplateColumns: "repeat(64, minmax(3px, 1fr))" }}>
                        {chunk.embeddingFirst64.map((v, i) => (
                          <div
                            key={i}
                            className="h-[18px] rounded-[2px] border border-white/[0.08] transition-all hover:scale-y-125 hover:shadow-[0_8px_18px_rgba(20,147,220,0.25)] hover:border-white/30"
                            style={{ backgroundColor: valueToColor(v) }}
                            title={`dim ${i}: ${v.toFixed(6)}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-2 flex items-center justify-between font-mono text-[10.5px] text-[#8592a8]">
                      <span>negative dims</span>
                      <span>near zero</span>
                      <span>positive dims</span>
                    </div>

                    {/* Raw values */}
                    <div className="mt-3">
                      <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-wider text-[#8592a8]">raw values</div>
                      <div className="max-h-[86px] overflow-auto break-all font-mono text-[10.5px] leading-[1.75] text-[#2c3343]">
                        [{chunk.embeddingFirst64.map((v) => v.toFixed(6)).join(", ")}]
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Concept + Code */}
        <div className="col-span-12 space-y-5 lg:col-span-6">
          {/* Concept card */}
          <div className="rounded-xl border border-[rgba(22,26,35,0.06)] bg-white p-6 shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
            <div className="mb-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-blue-1">Concept</span>
            </div>
            <h2 className="text-[20px] font-semibold leading-snug tracking-tight">
              What is an embedding?
            </h2>
            <p className="mt-3 text-[14.5px] leading-[1.75] text-[#4d5870]">
              An embedding maps a piece of text to a{" "}
              <span className="rounded border border-[rgba(22,26,35,0.1)] bg-[#fbfcfe] px-1.5 py-0.5 font-mono text-[11px] text-[#3d4659]">
                {data?.dimension ?? 1536}
              </span>
              -dimensional vector.{" "}
              <span className="font-medium text-[#161a23]">
                Texts with similar meaning produce similar vectors
              </span>
              — so we can use math (cosine distance) to find &quot;similar content.&quot;
            </p>
          </div>

          {/* Code block */}
          <CodeBlock filename="embedding.py" code={codeSnippet} />
        </div>
      </div>

      <StepNavButtons prevLabel="Previous" prevAnchor="#step-tags" nextLabel="Next: Ingest" onNext={onNext} />
    </section>
  );
}
