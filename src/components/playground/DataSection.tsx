import { StepProgress } from "./StepProgress";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";
import { Tag } from "@/components/ui/Tag";
import type { DatasetId } from "@/pages/playground";
import { StepNavButtons } from "./StepNavButtons";
import { trackEvent } from "@/lib/gtm";

interface DataSectionProps {
  selectedDataset: DatasetId;
  onSelectDataset: (id: DatasetId) => void;
  onNext: () => void;
}

const DATASETS = [
  {
    id: "docs",
    title: "Enterprise Docs QA",
    description: "Milvus official documentation excerpts",
    count: "338 docs",
    size: "~3.00MB",
    lang: "EN",
    tag: "Recommended",
    gradient: "from-[#2cb7ff] to-[#0878c2]",
    icon: (
      <svg viewBox="0 0 20 20" className="h-5 w-5 text-white">
        <path d="M5 3h7l3 3v11H5V3z M12 3v3h3" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
      </svg>
    ),
    preview: [
      { label: "Milvus · Collection Overview", text: '"A collection in Milvus is equivalent to a table in a relational database system. It is used to store and manage data..."' },
      { label: "Milvus · Index Types", text: '"Milvus supports multiple index types including IVF_FLAT, HNSW, and AUTOINDEX for efficient vector similarity search..."' },
      { label: "Milvus · Search Operations", text: '"The search operation in Milvus performs approximate nearest neighbor search on vector fields..."' },
    ],
  },
  {
    id: "legal",
    title: "Legal Contract Review",
    description: "CUAD public real contract excerpts",
    count: "56 contracts",
    size: "~3.04MB",
    lang: "EN",
    gradient: "from-[#fbbf24] to-[#d97706]",
    icon: (
      <svg viewBox="0 0 20 20" className="h-5 w-5 text-white">
        <path d="M4 3h8l4 4v10H4V3z M12 3v4h4 M7 10h6 M7 13h6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
      </svg>
    ),
    preview: [
      { label: "CUAD · Distributor Agreement", text: '"Company hereby appoints Distributor as Company\'s exclusive distributor within the Market..."' },
      { label: "CUAD · Strategic Alliance Agreement", text: '"The parties desire to enter into a strategic alliance under the terms and conditions set forth..."' },
      { label: "CUAD · Co-Marketing Agreement", text: '"Each party shall use commercially reasonable efforts to promote and market the products..."' },
    ],
  },
  {
    id: "arxiv",
    title: "arXiv AI Papers",
    description: "RAG-related paper abstracts from arXiv API",
    count: "1,500 papers",
    size: "~3.00MB",
    lang: "EN",
    gradient: "from-[#a78bfa] to-[#7c3aed]",
    icon: (
      <svg viewBox="0 0 20 20" className="h-5 w-5 text-white">
        <path d="M3 17V5a2 2 0 012-2h8l4 4v10a2 2 0 01-2 2H5a2 2 0 01-2-2z M13 3v4h4 M8 13l2-2 2 2 2-2" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
      </svg>
    ),
    preview: [
      { label: "arXiv · RAG Survey 2024", text: '"Retrieval-Augmented Generation has emerged as a key paradigm for grounding large language models in external knowledge..."' },
      { label: "arXiv · Dense Passage Retrieval", text: '"We investigate the effectiveness of dense representations for open-domain question answering retrieval..."' },
      { label: "arXiv · Self-RAG", text: '"Self-RAG trains an LM to adaptively retrieve passages on demand and reflect on retrieved passages..."' },
    ],
  },
];

export function DataSection({ selectedDataset, onSelectDataset, onNext }: DataSectionProps) {
  const dataset = DATASETS.find((d) => d.id === selectedDataset)!;

  return (
    <section id="step-data" className="animate-[rise_500ms_cubic-bezier(.2,.7,.2,1)_both]">
      {/* Header card */}
      <div className="rounded-xl border border-[rgba(22,26,35,0.06)] bg-white p-5 shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-blue-1">Step 1 of 7</span>
          <span className="h-1 w-1 rounded-full bg-[#b0bac9]" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#8592a8]">Prepare Data</span>
        </div>
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-[#0a0d14]">
          Pick a dataset to start
        </h1>
        <p className="mt-0.5 text-[14px] text-[#64718a]">
          With the cluster ready, the next step is to give the model &quot;external knowledge.&quot;
          <a
            href="https://docs.zilliz.com/docs/manage-collections"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-[3px] whitespace-nowrap text-[11.5px] font-medium text-blue-1 no-underline hover:text-blue-dark-1 hover:underline hover:[text-underline-offset:3px]"
          >
            Collections docs
            <ArrowRightIcon size={12} />
          </a>
        </p>

        <StepProgress currentStep={0} />
      </div>

      {/* Content grid */}
      <div className="mt-6 grid grid-cols-12 gap-6">
        {/* LEFT: Dataset cards */}
        <div className="col-span-12 lg:col-span-5">
          <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[rgba(22,26,35,0.06)] bg-white shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
            <div className="flex items-center justify-between border-b border-[rgba(22,26,35,0.06)] px-5 py-3.5">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-blue-1">
                  <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none" />
                  <path d="M3 8h14" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                <span className="text-[13px] font-medium">Pick a dataset</span>
              </div>
              <span className="font-mono text-[11px] text-[#8592a8]">3 preset</span>
            </div>

            <div className="space-y-3 p-5">
              {DATASETS.map((ds) => {
                const isSelected = ds.id === selectedDataset;
                return (
                  <div
                    key={ds.id}
                    onClick={() => {
                      trackEvent("playground_select_dataset", { dataset_id: ds.id });
                      onSelectDataset(ds.id as DatasetId);
                    }}
                    className={`group cursor-pointer rounded-[12px] p-[1.5px] transition-all ${
                      isSelected
                        ? "bg-gradient-to-l from-[#FF058A] via-[#B92BBA] to-[#531AEE]"
                        : "bg-stroke-1 hover:bg-[linear-gradient(270deg,#FF058A,#B92BBA,#531AEE)]"
                    }`}
                  >
                    <div className="rounded-[10.5px] bg-white p-4">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${ds.gradient}`}>
                          {ds.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="text-[14px] font-semibold">{ds.title}</div>
                            {ds.tag && (
                              <Tag label={ds.tag} variant="info" size="xs" />
                            )}
                          </div>
                          <div className="mt-0.5 text-[12px] text-[#64718a]">{ds.description}</div>
                          <div className="mt-2 flex items-center gap-3 font-mono text-[11px] text-[#8592a8]">
                            <span>{ds.count}</span>
                            <span className="h-1 w-1 rounded-full bg-[#b0bac9]" />
                            <span>{ds.size}</span>
                            <span className="h-1 w-1 rounded-full bg-[#b0bac9]" />
                            <span>{ds.lang}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Explain + Preview */}
        <div className="col-span-12 space-y-5 lg:col-span-7">
          {/* RAG explanation */}
          <div className="rounded-xl border border-[rgba(22,26,35,0.06)] bg-white p-6 shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
            <div className="mb-3 flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-widest text-blue-1">What is RAG?</span>
              <span className="h-1 w-1 rounded-full bg-[#b0bac9]" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-[#8592a8]">1 min read</span>
            </div>
            <h2 className="text-[20px] font-semibold leading-snug tracking-tight">
              Let LLMs answer with &quot;your knowledge&quot;
            </h2>
            <p className="mt-3 text-[14.5px] leading-[1.75] text-[#4d5870]">
              RAG (Retrieval-Augmented Generation) puts{" "}
              <span className="font-medium text-[#161a23]">&quot;retrieval&quot;</span> before{" "}
              <span className="font-medium text-[#161a23]">&quot;generation&quot;</span> — it
              first finds relevant passages from your data, then lets the LLM answer based on
              those passages. This avoids hallucination, enables traceability, and can leverage
              internal company knowledge.
            </p>

            {/* RAG flow diagram */}
            <div className="mt-5 flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-[rgba(22,26,35,0.06)] bg-[rgba(246,247,249,0.7)] p-3 text-center">
                <div className="mb-0.5 font-mono text-[10.5px] uppercase tracking-wider text-[#8592a8]">01</div>
                <div className="text-[12.5px] font-medium text-[#2c3343]">Your Data</div>
              </div>
              <ArrowRightIcon size={16} color="#b0bac9" />
              <div className="flex-1 rounded-lg border border-[#b6e4ff] bg-[#eff9ff] p-3 text-center">
                <div className="mb-0.5 font-mono text-[10.5px] uppercase tracking-wider text-blue-1">02</div>
                <div className="text-[12.5px] font-medium text-[#161a23]">Zilliz Cloud</div>
              </div>
              <ArrowRightIcon size={16} color="#b0bac9" />
              <div className="flex-1 rounded-lg border border-[rgba(22,26,35,0.06)] bg-[rgba(246,247,249,0.7)] p-3 text-center">
                <div className="mb-0.5 font-mono text-[10.5px] uppercase tracking-wider text-[#8592a8]">03</div>
                <div className="text-[12.5px] font-medium text-[#2c3343]">LLM Answer</div>
              </div>
            </div>
          </div>

          {/* Data preview */}
          <div className="overflow-hidden rounded-xl border border-[rgba(22,26,35,0.06)] bg-white shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
            <div className="flex items-center justify-between border-b border-[rgba(22,26,35,0.06)] px-5 py-3">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-[#64718a]">
                  <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.6" fill="none" />
                  <path d="M8 10l2 2 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                </svg>
                <span className="text-[12.5px] font-medium">
                  Preview · <span>{dataset.title}</span>
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#8592a8]">First 3 entries</span>
            </div>
            <div className="divide-y divide-[rgba(22,26,35,0.06)]">
              {dataset.preview.map((item, i) => (
                <div key={i} className="px-5 py-3 text-[12.5px] text-[#3d4659] hover:bg-[rgba(246,247,249,0.5)]">
                  <div className="mb-1 font-mono text-[10.5px] text-[#8592a8]">{item.label}</div>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <StepNavButtons nextLabel="Next: Chunk" onNext={onNext} />
    </section>
  );
}
