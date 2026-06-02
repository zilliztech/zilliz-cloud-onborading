import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";
import { useState, useEffect } from "react";
import { StepProgress } from "./StepProgress";
import { CodeBlock } from "./CodeBlock";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import type { DatasetId } from "@/pages/playground";
import { StepNavButtons } from "./StepNavButtons";
import { DATASET_FILE_MAP, DATASET_LABELS } from "@/pages/playground";
import { getRetrievalData } from "@/data/playground";
import { usePlaygroundData } from "@/hooks/usePlaygroundData";

interface SearchSectionProps {
  datasetId: DatasetId;
  insertCompleted: boolean;
}

function SimBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  return (
    <div className="relative mb-2 h-1 overflow-hidden rounded-full bg-[#eceff3]">
      <span
        className="absolute inset-0 rounded-full bg-gradient-to-r from-[#75d0ff] to-[#1493dc]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function SearchSection({ datasetId, insertCompleted }: SearchSectionProps) {
  const [selectedQ, setSelectedQ] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);

  const datasetFile = DATASET_FILE_MAP[datasetId];
  const datasetLabel = DATASET_LABELS[datasetId];
  const { data: questions, loading } = usePlaygroundData(
    () => getRetrievalData(datasetId),
    [datasetId],
  );

  // Generated-answer reveal. The answer is precomputed, but we "stream" it on
  // demand so it reads like the model is running live on the retrieved context.
  const [genState, setGenState] = useState<"idle" | "streaming" | "done">("idle");
  const [streamed, setStreamed] = useState("");
  const answer =
    questions?.[selectedQ]?.variants[selectedVariant]?.answer ?? "";

  // Reset whenever the question/variant changes or the pipeline is re-run.
  useEffect(() => {
    setGenState("idle");
    setStreamed("");
  }, [selectedQ, selectedVariant, insertCompleted]);

  // Typewriter reveal once the user clicks Generate.
  useEffect(() => {
    if (genState !== "streaming") return;
    if (!answer) {
      setGenState("done");
      return;
    }
    let i = 0;
    const step = Math.max(2, Math.round(answer.length / 140));
    const id = setInterval(() => {
      i += step;
      if (i >= answer.length) {
        setStreamed(answer);
        setGenState("done");
        clearInterval(id);
      } else {
        setStreamed(answer.slice(0, i));
      }
    }, 16);
    return () => clearInterval(id);
  }, [genState, answer]);

  if (loading || !questions) {
    return (
      <section id="step-search" className="animate-[rise_500ms_cubic-bezier(.2,.7,.2,1)_both]">
        <div className="flex items-center justify-center rounded-xl border border-[rgba(22,26,35,0.06)] bg-white p-12 shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
          <span className="text-[13px] text-[#8592a8]">Loading search data...</span>
        </div>
      </section>
    );
  }

  const question = questions[selectedQ];
  const variant = question?.variants[selectedVariant];
  // First variant (index 0) is always "All" — use it as dense baseline
  const baselineHits = question?.variants[0]?.hits ?? [];

  const codeSnippet = `from pymilvus import AnnSearchRequest, WeightedRanker

q_dense = oai.embeddings.create(
    model="text-embedding-3-small",
    input="${question?.query ?? "..."}",
).data[0].embedding

dense_req = AnnSearchRequest(
    data=[q_dense], anns_field="dense",
    param={"metric_type": "COSINE"}, limit=3,
)
bm25_req = AnnSearchRequest(
    data=["${question?.query ?? "..."}"],
    anns_field="sparse",
    param={"metric_type": "BM25"}, limit=3,
)

hits = client.hybrid_search(
    collection_name="${datasetFile}",
    reqs=[dense_req, bm25_req],
    ranker=WeightedRanker(0.7, 0.3),
    limit=3,
    output_fields=["text", "source", "chunk_id", "visibility"],
)[0]

context = "\\n\\n".join(h["entity"]["text"] for h in hits)
answer = oai.chat.completions.create(model="gpt-4o", ...)`;

  return (
    <section id="step-search" className="animate-[rise_500ms_cubic-bezier(.2,.7,.2,1)_both]">
      {/* Header */}
      <div className="rounded-xl border border-[rgba(22,26,35,0.06)] bg-white p-5 shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-blue-1">Step 6 of 7</span>
          <span className="h-1 w-1 rounded-full bg-[#b0bac9]" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#8592a8]">Retrieval + Generation</span>
        </div>
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-[#0a0d14]">
          Retrieve relevant passages + generate answers
        </h1>
        <p className="mt-0.5 text-[14px] text-[#64718a]">
          Compare Hybrid Search recall side-by-side, plus metadata filtering for more precise results
          <a href="https://docs.zilliz.com/docs/hybrid-search" target="_blank" rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-[3px] whitespace-nowrap text-[11.5px] font-medium text-blue-1 no-underline hover:text-blue-dark-1 hover:underline hover:[text-underline-offset:3px]">
            Hybrid search docs <ArrowRightIcon size={12} />
          </a>
        </p>
        <StepProgress currentStep={5} />
      </div>

      {/* Content grid */}
      <div className="mt-6 grid grid-cols-12 gap-6">
        {/* LEFT: Query interface */}
        <div className="col-span-12 lg:col-span-5">
          <div className="h-full rounded-xl border border-[rgba(22,26,35,0.06)] bg-white p-5 shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-blue-1">
                  <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" fill="currentColor" />
                </svg>
                <span className="text-[13px] font-medium">Conversational query</span>
              </div>
              <span className="font-mono text-[11px] text-[#8592a8]">Collection: {datasetLabel}</span>
            </div>

            {/* Question selection */}
            <div className="mb-4">
              <div className="mb-2 text-[12px] font-medium text-[#3d4659]">Select a question</div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => { setSelectedQ(i); setSelectedVariant(0); }}
                    className={`group min-h-[74px] cursor-pointer rounded-[12px] p-[1.5px] text-left transition-all ${
                      selectedQ === i
                        ? "bg-gradient-to-l from-[#FF058A] via-[#B92BBA] to-[#531AEE]"
                        : "bg-stroke-1 hover:bg-[linear-gradient(270deg,#FF058A,#B92BBA,#531AEE)]"
                    }`}
                  >
                    <div className="h-full rounded-[10.5px] bg-white px-3 py-2.5">
                      <div className={`font-mono text-[10px] uppercase tracking-[0.1em] ${selectedQ === i ? "text-blue-1" : "text-[#8592a8]"}`}>
                        Question {i + 1}
                      </div>
                      <div className={`mt-1 text-[12.5px] font-medium leading-snug ${selectedQ === i ? "text-black-1" : "text-black-2"}`}>
                        {q.query}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter bar */}
            {question && (
              <div className="mb-4 overflow-hidden rounded-xl border border-[rgba(22,26,35,0.06)] bg-[rgba(246,247,249,0.5)]">
                <div className="flex items-center justify-between gap-3 border-b border-[rgba(22,26,35,0.06)] bg-white px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-blue-1">
                      <path d="M3 4h14l-5 6v4l-4 2V10L3 4z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[12px] font-medium text-[#3d4659]">Metadata filter</span>
                  </div>
                  <div className="shrink-0 font-mono text-[11px] text-[#8592a8]">
                    {variant?.hits.length ?? 0}/{baselineHits.length} hits
                  </div>
                </div>
                <div className="px-3.5 py-3">
                  <div className="flex flex-wrap gap-2">
                    {question.variants.map((v, i) => (
                      <Button
                        key={i}
                        variant={selectedVariant === i ? "primary" : "ghost"}
                        size="small"
                        onClick={() => setSelectedVariant(i)}
                      >
                        {v.label}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-2 font-mono text-[10.5px] text-[#8592a8]">
                    filter: {variant?.filter ?? "none"}
                  </div>
                </div>
              </div>
            )}

            {/* Retrieval results — only show after insert */}
            {!insertCompleted && (
              <div className="rounded-lg border border-dashed border-[rgba(22,26,35,0.06)] bg-[rgba(246,247,249,0.3)] px-4 py-8 text-center text-[12.5px] text-[#8592a8]">
                Complete Step 5 (Insert) to see retrieval results
              </div>
            )}

            {insertCompleted && variant && (
              <div className="space-y-2">
                <div className="mb-2.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1493dc]" />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-blue-1">Hybrid results</span>
                  <span className="ml-auto font-mono text-[10.5px] text-[#059669]">dense + sparse</span>
                </div>
                <div className="max-h-[240px] space-y-2 overflow-y-auto">
                {variant.hits.map((hit, i) => (
                  <div key={i} className="rounded-lg border border-[rgba(22,26,35,0.06)] bg-white p-2.5">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#8592a8]">#{i + 1}</span>
                      <span className="font-mono text-[10px] font-semibold text-blue-1">{hit.score.toFixed(3)}</span>
                    </div>
                    <SimBar score={hit.score} />
                    <p className="text-[11.5px] leading-relaxed text-[#3d4659]">
                      {hit.text.length > 200 ? hit.text.slice(0, 200) + "..." : hit.text}
                    </p>
                  </div>
                ))}
                </div>
              </div>
            )}

            {/* Generated answer — only show after insert */}
            {insertCompleted && variant?.answer && (
              <div className="mt-5 border-t border-[rgba(22,26,35,0.06)] pt-5">
                <div className="mb-3 flex items-center gap-2">
                  <svg viewBox="0 0 20 20" className="h-4 w-4 text-blue-1">
                    <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6l-4 3V5z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  </svg>
                  <span className="text-[12px] font-medium">Generated answer</span>
                  {genState === "streaming" && (
                    <span className="font-mono text-[10.5px] text-blue-1">generating…</span>
                  )}
                </div>

                {genState === "idle" ? (
                  <Button onClick={() => setGenState("streaming")} variant="primary" size="small">
                    Generate answer
                  </Button>
                ) : (
                  <div className="rounded-2xl rounded-bl border border-[rgba(22,26,35,0.08)] bg-white p-4 text-[13px] leading-[1.75] text-[#2c3343] shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_14px_rgba(13,43,72,0.05)]">
                    {genState === "streaming" ? streamed : variant.answer}
                    {genState === "streaming" && (
                      <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[2px] animate-pulse bg-blue-1 align-middle" />
                    )}
                    {genState === "done" && (
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {variant.citations.map((c, i) => (
                          <Tag key={i} label={c} variant="info" size="small" />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Concept + Code */}
        <div className="col-span-12 flex h-full flex-col gap-5 lg:col-span-7">
          {/* Concept card */}
          <div className="shrink-0 rounded-xl border border-[rgba(22,26,35,0.06)] bg-white p-6 shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
            <div className="mb-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-blue-1">Concept</span>
            </div>
            <h2 className="text-[20px] font-semibold leading-snug tracking-tight">
              Why is Hybrid Search more accurate than Dense only?
            </h2>
            <p className="mt-3 text-[14.5px] leading-[1.75] text-[#4d5870]">
              Dense retrieval is strong at semantic similarity, but it can miss exact terms,
              proper nouns, IDs, and version numbers. Sparse retrieval such as BM25 is strong
              at lexical matching.{" "}
              <span className="font-medium text-[#161a23]">
                Hybrid search combines both result rankings, often with RRF
              </span>
              , so semantic and keyword signals can complement each other.
            </p>

            {/* Dense vs Hybrid comparison */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-[rgba(22,26,35,0.06)] bg-[rgba(246,247,249,0.7)] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[rgba(22,26,35,0.06)] bg-white">
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-[#64718a]">
                      <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  </div>
                  <span className="text-[13px] font-medium text-[#2c3343]">Dense only</span>
                </div>
                <div className="space-y-1.5 text-[12px] text-[#64718a]">
                  <div>&#10003; Semantic similarity</div>
                  <div className="text-[#8592a8]">&#10007; Misses terminology</div>
                  <div className="text-[#8592a8]">&#10007; Recall@10: <span className="font-mono">0.76</span></div>
                </div>
              </div>
              <div className="rounded-lg border border-[#b6e4ff] bg-gradient-to-br from-[#eff9ff] to-white p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1493dc] text-white">
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5">
                      <path d="M8 2l1.5 4.5h4.5L10.5 9.5 12 14 8 11.5 4 14l1.5-4.5L2 6.5h4.5z" fill="currentColor" />
                    </svg>
                  </div>
                  <span className="text-[13px] font-medium text-[#161a23]">Hybrid</span>
                </div>
                <div className="space-y-1.5 text-[12px]">
                  <div className="text-[#047857]">&#10003; Semantic + keywords</div>
                  <div className="text-[#047857]">&#10003; Proper noun recall</div>
                  <div className="text-[#047857]">&#10003; Recall@10: <span className="font-mono font-semibold">0.89</span> <span className="text-[10.5px] text-[#8592a8]">(+17%)</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Code block */}
          <div className="min-h-0 flex-1">
            <CodeBlock filename="hybrid_search.py" code={codeSnippet} maxHeight={320} />
          </div>
        </div>
      </div>

      <StepNavButtons prevLabel="Previous" prevAnchor="#step-ingest" />
    </section>
  );
}
