import { useState } from "react";
import { StepProgress } from "./StepProgress";
import { ArrowRightIcon, DocsIcon, IMIcon, MSNIcon } from "@/components/icons/ArrowRightIcon";

interface ExportSectionProps {
  datasetId: string;
  preset: string;
}

const RATINGS = [
  { emoji: "😍", label: "Amazing" },
  { emoji: "🙂", label: "Good" },
  { emoji: "😐", label: "Meh" },
  { emoji: "😞", label: "Not useful" },
];

const USE_CASES = [
  "Customer Support KB",
  "Tech Doc QA",
  "Legal / Contract Review",
  "Internal Search",
  "E-commerce Recs",
  "Code Search",
  "Agent Memory",
];

const NEXT_FEATURES = [
  "Multi-modal (text-to-image / image-to-image)",
  "Agent + Tool Calling",
  "Production optimization (recall tuning)",
  "Monitoring + Evaluation",
];

export function ExportSection({ datasetId, preset }: ExportSectionProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedUseCases, setSelectedUseCases] = useState<Set<string>>(new Set());

  const toggleUseCase = (uc: string) => {
    setSelectedUseCases((prev) => {
      const next = new Set(prev);
      if (next.has(uc)) next.delete(uc);
      else next.add(uc);
      return next;
    });
  };

  return (
    <section id="step-export" className="animate-[rise_500ms_cubic-bezier(.2,.7,.2,1)_both]">
      {/* Header */}
      <div className="rounded-xl border border-[rgba(22,26,35,0.06)] bg-white p-5 shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-blue-1">Complete</span>
          <span className="h-1 w-1 rounded-full bg-[#b0bac9]" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#8592a8]">Export</span>
        </div>
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-[#0a0d14]">
          Take your code with you
        </h1>
        <p className="mt-0.5 text-[14px] text-[#64718a]">
          Your complete RAG app is packaged and ready. Download it and run locally.
          <a href="https://docs.zilliz.com/docs/quick-start" target="_blank" rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-[3px] whitespace-nowrap text-[11.5px] font-medium text-blue-1 no-underline hover:text-blue-dark-1 hover:underline hover:[text-underline-offset:3px]">
            Quickstart docs <ArrowRightIcon size={12} />
          </a>
        </p>
        <StepProgress currentStep={6} />
      </div>

      {/* Content — single column, no left panel */}
      <div className="mt-6 space-y-5">
        {/* Feedback */}
        <div className="rounded-xl border border-[rgba(22,26,35,0.06)] bg-white p-6 shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
          <div className="mb-4">
            <span className="font-mono text-[11px] uppercase tracking-widest text-blue-1">Feedback</span>
          </div>
          <h2 className="text-[20px] font-semibold leading-snug tracking-tight">How was the experience?</h2>
          <p className="mt-1 text-[13.5px] text-[#64718a]">Take 30 seconds to tell us — help us build a better demo</p>

          {/* Rating */}
          <div className="mt-5 flex items-center gap-2">
            {RATINGS.map((r, i) => (
              <button
                key={i}
                onClick={() => setSelectedRating(i)}
                className={`flex-1 cursor-pointer rounded-xl border-2 p-4 text-center transition ${
                  selectedRating === i
                    ? "border-[#2cb7ff] bg-[#eff9ff]"
                    : "border-[rgba(22,26,35,0.06)] hover:border-[#2cb7ff] hover:bg-[#eff9ff]"
                }`}
              >
                <div className="text-2xl">{r.emoji}</div>
                <div className={`mt-1.5 text-[12px] font-medium ${selectedRating === i ? "text-[#0a5f9e]" : "text-[#3d4659]"}`}>{r.label}</div>
              </button>
            ))}
          </div>

          {/* Use cases */}
          <div className="mt-6">
            <div className="mb-2.5 text-[13px] font-medium text-[#161a23]">
              Which use case fits your business? <span className="font-normal text-[#8592a8]">(multi-select)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {USE_CASES.map((uc) => (
                <button
                  key={uc}
                  onClick={() => toggleUseCase(uc)}
                  className={`cursor-pointer rounded-lg border-2 px-3 py-1.5 text-[12.5px] font-medium transition ${
                    selectedUseCases.has(uc)
                      ? "border-[#2cb7ff] bg-[#eff9ff] text-[#0a5f9e]"
                      : "border-[rgba(22,26,35,0.06)] bg-white text-[#4d5870] hover:border-[#2cb7ff]"
                  }`}
                >
                  {uc}
                </button>
              ))}
            </div>
          </div>

          {/* Next features */}
          <div className="mt-6 border-t border-[rgba(22,26,35,0.06)] pt-5">
            <div className="mb-2.5 text-[13px] font-medium text-[#161a23]">What do you want to see next?</div>
            <div className="grid grid-cols-2 gap-2">
              {NEXT_FEATURES.map((f) => (
                <label key={f} className="flex cursor-pointer items-center gap-2 rounded-lg border border-[rgba(22,26,35,0.06)] bg-white px-3 py-2.5 transition hover:border-[#2cb7ff]">
                  <input type="checkbox" className="accent-[#1493dc]" />
                  <span className="text-[12.5px] text-[#2c3343]">{f}</span>
                </label>
              ))}
            </div>
          </div>

          <button className="mt-5 w-full cursor-pointer rounded-xl bg-blue-1 px-4 py-3 text-[14px] font-semibold text-white transition-all hover:bg-blue-dark-1">
            Submit feedback
          </button>

          {/* Download code */}
          <a
            href="#"
            download
            className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[rgba(22,26,35,0.12)] bg-white px-4 py-3 text-[14px] font-semibold text-[#3d4659] shadow-[0_1px_2px_rgba(13,43,72,0.04)] transition hover:border-[#1493dc] hover:text-blue-1"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4">
              <path d="M10 3v10 M5 9l5 5 5-5 M3 17h14" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download code
          </a>
        </div>

        {/* Next steps */}
        <div className="rounded-xl border border-[rgba(22,26,35,0.06)] bg-white p-6 shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
          <div className="mb-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#64718a]">What&apos;s next</span>
          </div>
          <h3 className="text-[17px] font-semibold leading-snug tracking-tight">Use this code in your business</h3>
          <div className="mt-4 space-y-2">
            {([
              { href: "https://docs.zilliz.com/docs", title: "Full Documentation", desc: "Complete guide from getting started to production", icon: <DocsIcon /> },
              { href: "https://discord.com/invite/8uyFbECzPX", title: "Join Discord", desc: "Zilliz team + developer community, instant support", icon: <IMIcon /> },
              { href: "https://zilliz.com/contact-sales", title: "Get help going to production", desc: "Contact experts for a free consultation", icon: <MSNIcon /> },
            ] as const).map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-lg border border-[rgba(22,26,35,0.06)] p-3.5 transition hover:border-[#2cb7ff] hover:bg-[rgba(239,249,255,0.4)]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eff9ff]">
                  {link.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium text-[#161a23]">{link.title}</div>
                  <div className="mt-0.5 text-[11.5px] text-[#64718a]">{link.desc}</div>
                </div>
                <ArrowRightIcon size={16} color="#8592a8" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
