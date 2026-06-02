import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";
import { useState } from "react";
import { StepProgress } from "./StepProgress";
import { CodeBlock } from "./CodeBlock";
import { Tag } from "@/components/ui/Tag";
import { Alert } from "@/components/ui/Alert";
import { StepNavButtons } from "./StepNavButtons";
import type { DatasetId, ChunkPreset } from "@/pages/playground";
import { DATASET_FILE_MAP } from "@/pages/playground";
import { getMetadataPreview } from "@/data/playground";
import { usePlaygroundData } from "@/hooks/usePlaygroundData";

import { Button } from "@/components/ui/Button";

interface TagsSectionProps {
  datasetId: DatasetId;
  preset: ChunkPreset;
  onConfirm: () => void;
  confirmed: boolean;
  onNext: () => void;
}

export function TagsSection({ datasetId, preset, onConfirm, confirmed, onNext }: TagsSectionProps) {
  const [tagging, setTagging] = useState(false);
  const tagged = confirmed;

  const datasetFile = DATASET_FILE_MAP[datasetId];
  const { data, loading } = usePlaygroundData(
    () => getMetadataPreview(datasetId, preset),
    [datasetId, preset],
  );

  if (loading || !data) {
    return (
      <section id="step-tags" className="animate-[rise_500ms_cubic-bezier(.2,.7,.2,1)_both]">
        <div className="flex items-center justify-center rounded-xl border border-[rgba(22,26,35,0.06)] bg-white p-12 shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
          <span className="text-[13px] text-[#8592a8]">Loading metadata preview...</span>
        </div>
      </section>
    );
  }

  const handleTag = () => {
    setTagging(true);
    setTimeout(() => {
      setTagging(false);
      onConfirm();
    }, 800);
  };

  const codeSnippet = datasetId === "legal"
    ? `SOURCE = "${datasetFile}.step2-source.md"

def clause_type(chunk):
    s = chunk.lower()
    if "exclusive" in s or "appoint" in s:
        return "appointment"
    if "minimum" in s:
        return "minimum_commitment"
    if "term" in s or "renew" in s:
        return "term"
    return "general"

records = []
for i, chunk in enumerate(chunks):
    records.append({
        "id": i,
        "text": chunk,
        "source": SOURCE,
        "chunk_id": i,
        "page": i // 8 + 1,
        "clause_type": clause_type(chunk),
        "party": ["company", "distributor", "both"][i % 3],
        "effective_date": "2026-01-01",
        "visibility": "public",
    })`
    : datasetId === "arxiv"
    ? `SOURCE = "${datasetFile}.step2-source.md"

records = []
for i, chunk in enumerate(chunks):
    records.append({
        "id": i,
        "text": chunk,
        "source": SOURCE,
        "chunk_id": i,
        "arxiv_id": extract_arxiv_id(chunk),
        "category": extract_category(chunk),
        "year": extract_year(chunk),
        "section": infer_section(chunk),
        "visibility": "public",
    })`
    : `SOURCE = "${datasetFile}.step2-source.md"

records = []
for i, chunk in enumerate(chunks):
    records.append({
        "id": i,
        "text": chunk,
        "source": SOURCE,
        "chunk_id": i,
        "page": i // 8 + 1,
        "section": infer_section(chunk),
        "product_area": infer_product_area(chunk),
        "visibility": "public",
    })`;

  return (
    <section id="step-tags" className="animate-[rise_500ms_cubic-bezier(.2,.7,.2,1)_both]">
      {/* Header card */}
      <div className="rounded-xl border border-[rgba(22,26,35,0.06)] bg-white p-5 shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-blue-1">Step 3 of 7</span>
          <span className="h-1 w-1 rounded-full bg-[#b0bac9]" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#8592a8]">Metadata</span>
        </div>
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-[#0a0d14]">
          Tag each chunk with metadata
        </h1>
        <p className="mt-0.5 text-[14px] text-[#64718a]">
          Metadata fields are what take RAG from demo to production.
        </p>
        <StepProgress currentStep={2} />
      </div>

      {/* Content grid */}
      <div className="mt-6 grid grid-cols-12 gap-6">
        {/* LEFT: Metadata fields + chunks */}
        <div className="col-span-12 flex h-full flex-col gap-4 lg:col-span-6">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[rgba(22,26,35,0.06)] bg-white shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-[rgba(22,26,35,0.06)] px-5 py-3.5">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-blue-1">
                  <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" fill="none" />
                  <path d="M3 8h14M8 3v14" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                <span className="text-[13px] font-medium">Metadata fields</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#64718a]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                <span>{data.chunkCount ?? "—"} chunks</span>
              </div>
            </div>

            {/* Field tags */}
            <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[rgba(22,26,35,0.06)] bg-[rgba(246,247,249,0.4)] px-5 py-3">
              <span className="font-mono text-[11px] text-[#64718a]">Fields:</span>
              {data.metadataFields.map((field) => (
                <Tag key={field} label={field} variant="info" size="small" />
              ))}
            </div>

            {/* Action button */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[rgba(22,26,35,0.06)] bg-white px-5 py-3">
              <div>
                <div className="text-[12.5px] font-medium text-[#2c3343]">Generate metadata</div>
                <div className="mt-0.5 font-mono text-[11px] text-[#8592a8]">
                  {tagged ? "Tags applied to all chunks" : "Waiting to add fields to all chunks"}
                </div>
              </div>
              <Button
                variant={tagged ? "success" : "primary"}
                size="small"
                loading={tagging}
                disabled={tagged}
                onClick={handleTag}
              >
                {tagged ? "✓ Tagged" : "Start tagging"}
              </Button>
            </div>

            {/* Chunks list */}
            <div className="min-h-0 flex-1 divide-y divide-[rgba(22,26,35,0.06)] overflow-y-auto">
              {data.chunks.map((chunk, i) => (
                <div key={i} className="px-4 py-3 transition hover:bg-[rgba(246,247,249,0.3)]">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded bg-[#eceff3] px-1.5 py-0.5 font-mono text-[10px] text-[#4d5870]">
                      #{i + 1}
                    </span>
                    <span className="truncate text-[11.5px] text-[#2c3343]">
                      {chunk.text}
                    </span>
                  </div>
                  {tagged && (
                    <div className="ml-6 flex flex-wrap gap-1">
                      {Object.entries(chunk.meta).map(([key, val]) => (
                        <span
                          key={key}
                          className="rounded bg-[#eff9ff] px-1.5 py-0.5 font-mono text-[10px] text-[#0a5f9e]"
                        >
                          {key}: {String(val)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tip box */}
          <div className="shrink-0">
            <Alert severity="info">
              <div className="text-[13px] font-medium text-black-1">Pro tip</div>
              <div className="mt-1">
                These fields are stored alongside chunks in Zilliz Cloud. At search time you can filter with expressions like{" "}
                <span className="rounded bg-[#eceff3] px-1 font-mono text-[11.5px] text-black-1">visibility == &quot;public&quot;</span>,{" "}
                <span className="rounded bg-[#eceff3] px-1 font-mono text-[11.5px] text-black-1">page &gt;= 3</span>{" "}
                before running vector recall.
              </div>
            </Alert>
          </div>
        </div>

        {/* RIGHT: Concept + Code */}
        <div className="col-span-12 flex h-full flex-col gap-5 lg:col-span-6">
          {/* Concept card */}
          <div className="shrink-0 rounded-xl border border-[rgba(22,26,35,0.06)] bg-white p-4 shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-1 font-mono text-[11px] uppercase tracking-widest text-blue-1">Concept</div>
                <h2 className="text-[18px] font-semibold leading-snug tracking-tight">
                  Metadata defines the filter scope
                </h2>
              </div>
              <a
                href="https://docs.zilliz.com/docs/filtered-search"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-flex shrink-0 items-center gap-[3px] whitespace-nowrap text-[11.5px] font-medium text-blue-1 no-underline hover:text-blue-dark-1 hover:underline hover:[text-underline-offset:3px]"
              >
                Filtered search docs
                <ArrowRightIcon size={12} />
              </a>
            </div>
            <p className="mt-2 text-[13.5px] leading-[1.65] text-[#4d5870]">
              Metadata makes retrieval controllable. Filter by source, section, date,
              or permission before vector search, so results come only from allowed
              and relevant chunks.
            </p>
          </div>

          {/* Code block */}
          <div className="min-h-0 flex-1">
            <CodeBlock filename="metadata.py" code={codeSnippet} />
          </div>
        </div>
      </div>

      <StepNavButtons prevLabel="Previous" prevAnchor="#step-chunk" nextLabel="Next: Vector" onNext={onNext} nextDisabled={!confirmed} nextHint="Apply tags first" />
    </section>
  );
}
