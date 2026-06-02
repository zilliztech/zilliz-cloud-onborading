import { useState } from "react";
import { StepProgress } from "./StepProgress";
import { CodeBlock } from "./CodeBlock";
import { StepNavButtons } from "./StepNavButtons";
import { Button } from "@/components/ui/Button";
import type { DatasetId, ChunkPreset } from "@/pages/playground";
import { DATASET_FILE_MAP, DATASET_LABELS } from "@/pages/playground";
import { getChunkPreview } from "@/data/playground";
import { usePlaygroundData } from "@/hooks/usePlaygroundData";

interface ChunkSectionProps {
  datasetId: DatasetId;
  selectedPreset: ChunkPreset;
  onSelectPreset: (preset: ChunkPreset) => void;
  onConfirm: () => void;
  confirmed: boolean;
  onNext: () => void;
}

const PRESETS: { id: ChunkPreset; label: string; description: string; chunkSize: number; overlap: number; displayChunks: number }[] = [
  {
    id: "small",
    label: "Small",
    description: "Finer granularity, ideal for FAQ, short notes, term definitions.",
    chunkSize: 256,
    overlap: 40,
    displayChunks: 4,
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "Default delivery, works well for most document QA.",
    chunkSize: 512,
    overlap: 80,
    displayChunks: 2,
  },
  {
    id: "large",
    label: "Large",
    description: "Preserves more context, ideal for long paragraphs and contract clauses.",
    chunkSize: 1024,
    overlap: 160,
    displayChunks: 1,
  },
];

const CHUNK_COLORS = [
  "bg-[#e0f2fe] text-[#0a5f9e] shadow-[inset_0_0_0_1px_#b6e4ff]",
  "bg-[#fef3c7] text-[#854d0e] shadow-[inset_0_0_0_1px_#fde68a]",
  "bg-[#dcfce7] text-[#166534] shadow-[inset_0_0_0_1px_#bbf7d0]",
  "bg-[#fce7f3] text-[#9d174d] shadow-[inset_0_0_0_1px_#fbcfe8]",
  "bg-[#ede9fe] text-[#5b21b6] shadow-[inset_0_0_0_1px_#ddd6fe]",
];

export function ChunkSection({
  datasetId,
  selectedPreset,
  onSelectPreset,
  onConfirm,
  confirmed,
  onNext,
}: ChunkSectionProps) {
  const [confirming, setConfirming] = useState(false);
  const datasetFile = DATASET_FILE_MAP[datasetId];
  const datasetLabel = DATASET_LABELS[datasetId];

  const preset = PRESETS.find((p) => p.id === selectedPreset)!;
  const { data: chunkData, loading } = usePlaygroundData(
    () => getChunkPreview(datasetId, selectedPreset),
    [datasetId, selectedPreset],
  );

  if (loading || !chunkData) {
    return (
      <section id="step-chunk" className="animate-[rise_500ms_cubic-bezier(.2,.7,.2,1)_both]">
        <div className="flex items-center justify-center rounded-xl border border-[rgba(22,26,35,0.06)] bg-white p-12 shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
          <span className="text-[13px] text-[#8592a8]">Loading chunk preview...</span>
        </div>
      </section>
    );
  }

  const displayChunks = chunkData.chunks;

  return (
    <section id="step-chunk" className="animate-[rise_500ms_cubic-bezier(.2,.7,.2,1)_both]">
      {/* Header card */}
      <div className="rounded-xl border border-[rgba(22,26,35,0.06)] bg-white p-5 shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-blue-1">Step 2 of 7</span>
          <span className="h-1 w-1 rounded-full bg-[#b0bac9]" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#8592a8]">Chunking</span>
        </div>
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-[#0a0d14]">
          Split text into chunks
        </h1>
        <p className="mt-0.5 text-[14px] text-[#64718a]">
          Break long documents into appropriately sized chunks for more precise retrieval
        </p>
        <StepProgress currentStep={1} />
      </div>

      {/* Content grid */}
      <div className="mt-6 grid grid-cols-12 gap-6">
        {/* LEFT: Chunk parameters & preview */}
        <div className="col-span-12 lg:col-span-5">
          <div className="overflow-hidden rounded-xl border border-[rgba(22,26,35,0.06)] bg-white shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[rgba(22,26,35,0.06)] px-5 py-3.5">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-blue-1">
                  <path d="M3 6h14M3 10h14M3 14h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <span className="text-[13px] font-medium">Chunk parameters</span>
              </div>
            </div>

            {/* Preset selection */}
            <div className="space-y-4 border-b border-[rgba(22,26,35,0.06)] bg-[rgba(246,247,249,0.5)] px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="text-[12px] font-medium text-[#2c3343]">Select chunk preset</div>
                <div className="shrink-0 text-right">
                  <div className="font-mono text-[10.5px] text-[#8592a8]">Selected</div>
                  <div className="font-mono text-[12px] text-[#0a5f9e]">{preset.label}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map((p) => {
                  const isActive = p.id === selectedPreset;
                  return (
                    <button
                      key={p.id}
                      onClick={() => onSelectPreset(p.id)}
                      className={`group min-h-[142px] cursor-pointer rounded-[12px] p-[1.5px] text-left transition-all ${
                        isActive
                          ? "bg-gradient-to-l from-[#FF058A] via-[#B92BBA] to-[#531AEE]"
                          : "bg-stroke-1 hover:bg-[linear-gradient(270deg,#FF058A,#B92BBA,#531AEE)]"
                      }`}
                    >
                      <div className="flex h-full flex-col justify-between rounded-[10.5px] bg-white p-3">
                        <div>
                          <div className="text-[13px] font-semibold text-[#161a23]">{p.label}</div>
                          <div className="mt-1 text-[11.5px] leading-relaxed text-[#64718a]">{p.description}</div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-1.5">
                          <div className={`rounded-md px-2 py-1 ${isActive ? "bg-[#f2f3ff]" : "bg-[#f6f7f9]"}`}>
                            <div className={`font-mono text-[9.5px] uppercase tracking-wider ${isActive ? "text-blue-1" : "text-[#8592a8]"}`}>Chunk</div>
                            <div className={`font-mono text-[12px] ${isActive ? "text-[#161a23]" : "text-[#2c3343]"}`}>
                              {p.chunkSize}
                            </div>
                          </div>
                          <div className={`rounded-md px-2 py-1 ${isActive ? "bg-[#f2f3ff]" : "bg-[#f6f7f9]"}`}>
                            <div className={`font-mono text-[9.5px] uppercase tracking-wider ${isActive ? "text-blue-1" : "text-[#8592a8]"}`}>Overlap</div>
                            <div className={`font-mono text-[12px] ${isActive ? "text-[#161a23]" : "text-[#2c3343]"}`}>
                              {p.overlap}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chunks preview */}
            <div className="px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-[#8592a8]">
                    <path d="M5 2h7l3 3v13H5V2z M12 2v3h3" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
                  </svg>
                  <span className="font-mono text-[12px] text-[#64718a]">{datasetLabel}</span>
                </div>
                {displayChunks.length > 0 && (
                  <span className="text-[11px] text-[#8592a8]">
                    {displayChunks.reduce((s, c) => s + c.text.length, 0)} chars
                  </span>
                )}
              </div>

              {/* Colored chunk visualization */}
              <div className="rounded-lg border border-[rgba(22,26,35,0.06)] bg-white p-4 text-[13.5px] leading-[1.85] text-[#2c3343]">
                {displayChunks.map((chunk, i) => (
                  <span key={i} className={`inline rounded-[0.45em] px-[0.35em] py-[0.15em] mx-px ${CHUNK_COLORS[i % CHUNK_COLORS.length]}`}>
                    {chunk.text.length > 500 ? chunk.text.slice(0, 500) + "..." : chunk.text}
                  </span>
                ))}
              </div>

              {/* Statistics */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-[rgba(22,26,35,0.06)] bg-white p-3">
                  <div className="font-mono text-[10.5px] uppercase tracking-wider text-[#8592a8]">Chunks</div>
                  <div className="mt-1">
                    <span className="text-[20px] font-semibold">{preset.displayChunks}</span>
                  </div>
                </div>
                <div className="rounded-lg border border-[rgba(22,26,35,0.06)] bg-white p-3">
                  <div className="font-mono text-[10.5px] uppercase tracking-wider text-[#8592a8]">Avg len</div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-[20px] font-semibold">
                      {displayChunks.length > 0
                        ? Math.round(displayChunks.reduce((s, c) => s + c.text.length, 0) / displayChunks.length)
                        : "—"}
                    </span>
                    <span className="text-[11px] text-[#8592a8]">chars</span>
                  </div>
                </div>
                <div className="rounded-lg border border-[rgba(22,26,35,0.06)] bg-white p-3">
                  <div className="font-mono text-[10.5px] uppercase tracking-wider text-[#8592a8]">Coverage</div>
                  <div className="mt-1">
                    <span className="text-[20px] font-semibold">100%</span>
                  </div>
                </div>
              </div>

              {/* Confirm chunking */}
              <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-[rgba(22,26,35,0.06)] bg-white p-3">
                <div>
                  <div className="text-[12.5px] font-medium text-[#2c3343]">Confirm chunking</div>
                  <div className="mt-0.5 font-mono text-[11px] text-[#8592a8]">
                    {confirmed
                      ? `✓ Chunked entire document → ${chunkData.chunkCount.toLocaleString()} chunks`
                      : `Chunk size ${preset.chunkSize} · Overlap ${preset.overlap}`}
                  </div>
                </div>
                <Button
                  variant={confirmed ? "success" : "primary"}
                  size="small"
                  loading={confirming}
                  disabled={confirmed}
                  onClick={() => {
                    setConfirming(true);
                    setTimeout(() => {
                      setConfirming(false);
                      onConfirm();
                    }, 800);
                  }}
                >
                  {confirmed ? "✓ Confirmed" : "Confirm & continue"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Concept + Code */}
        <div className="col-span-12 space-y-5 lg:col-span-7">
          {/* Concept card */}
          <div className="rounded-xl border border-[rgba(22,26,35,0.06)] bg-white p-6 shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
            <div className="mb-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-blue-1">Concept</span>
            </div>
            <h2 className="text-[20px] font-semibold leading-snug tracking-tight">
              Why split documents into chunks?
            </h2>
            <p className="mt-3 text-[14.5px] leading-[1.75] text-[#4d5870]">
              Document chunking affects recall precision and context completeness. Smaller chunks
              are easier to match precisely, while larger chunks preserve more context; overlap
              reduces information gaps between adjacent chunks.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-[rgba(22,26,35,0.06)] bg-[rgba(246,247,249,0.7)] px-3 py-2.5">
                <div className="font-mono text-[11px] uppercase tracking-wider text-[#8592a8]">Too small</div>
                <div className="mt-0.5 text-[12.5px] text-[#3d4659]">Loses context</div>
              </div>
              <div className="rounded-lg border border-[#b6e4ff] bg-[#eff9ff] px-3 py-2.5">
                <div className="font-mono text-[11px] uppercase tracking-wider text-blue-1">Just right</div>
                <div className="mt-0.5 text-[12.5px] font-medium text-[#161a23]">Semantically complete</div>
              </div>
              <div className="rounded-lg border border-[rgba(22,26,35,0.06)] bg-[rgba(246,247,249,0.7)] px-3 py-2.5">
                <div className="font-mono text-[11px] uppercase tracking-wider text-[#8592a8]">Too large</div>
                <div className="mt-0.5 text-[12.5px] text-[#3d4659]">Lower recall</div>
              </div>
            </div>
          </div>

          {/* Code card */}
          <CodeBlock
            filename="chunking.py"
            code={`from langchain_text_splitters import RecursiveCharacterTextSplitter

with open("datasets/${datasetFile}.step2-source.md", "r", encoding="utf-8") as f:
    text = f.read()

splitter = RecursiveCharacterTextSplitter(
    chunk_size=${preset.chunkSize},
    chunk_overlap=${preset.overlap},
    separators=["\\n\\n", "\\n", ". "],
)

chunks = splitter.split_text(text)
print("chunks:", len(chunks))`}
          />
        </div>
      </div>

      <StepNavButtons prevLabel="Previous" prevAnchor="#step-data" nextLabel="Next: Tags" onNext={onNext} />
    </section>
  );
}
