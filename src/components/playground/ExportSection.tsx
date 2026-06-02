import { useState } from "react";
import { StepProgress } from "./StepProgress";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";

const HUBSPOT_PORTAL_ID = "24054828";
const HUBSPOT_FORM_GUID = "7146e30c-d553-48f0-a85f-fd9448543662";

interface ExportSectionProps {
  email: string;
}

const RATINGS = [
  { emoji: "😍", label: "Excellent", value: "Excellent" },
  { emoji: "🙂", label: "Good", value: "Good" },
  { emoji: "😐", label: "Average", value: "Average" },
  { emoji: "😞", label: "Not useful", value: "Not useful" },
];

const USE_CASES: { label: string; value: string }[] = [
  { label: "Support Knowledge Base", value: "Support knowledge base" },
  { label: "Technical Documentation Q&A", value: "Technical documentation Q&A" },
  { label: "Legal / Contract Review", value: "Legal / contract review" },
  { label: "Agent Memory", value: "Agent Memory" },
  { label: "Internal Search", value: "Internal search" },
  { label: "Other", value: "Other" },
];

const NEXT_FEATURES: { label: string; value: string }[] = [
  { label: "Multimodal Search", value: "Multimodal Search" },
  { label: "Agent Tool Use", value: "Agent Tool Use" },
  { label: "Production Optimization", value: "Production Optimization" },
  { label: "Monitoring & Evaluation", value: "Monitoring & Evaluation" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = (value: string) => EMAIL_RE.test(value.trim());

// Checkbox matching @zilliz/zui ZCheckbox's default look (filled #3f46ff box +
// white check). We can't import the real component — zui ships SCSS-syntax CSS
// that Turbopack's CSS parser rejects — so we replicate its default style.
function ZCheck({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <span className="relative inline-flex h-4 w-4 shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
      />
      <span className="h-4 w-4 rounded-[4px] border border-[rgba(22,26,35,0.25)] bg-white transition-colors peer-checked:border-[#3f46ff] peer-checked:bg-[#3f46ff]" />
      <svg
        viewBox="0 0 10 10"
        className="pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity peer-checked:opacity-100"
      >
        <path d="M1 4L3.66667 7.33333L9 2" stroke="white" strokeWidth="1.4" fill="none" />
      </svg>
    </span>
  );
}

export function ExportSection({ email }: ExportSectionProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedUseCases, setSelectedUseCases] = useState<Set<string>>(new Set());
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());
  const [additionalFeedback, setAdditionalFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [manualEmail, setManualEmail] = useState("");

  const toggleUseCase = (value: string) => {
    setSelectedUseCases((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const toggleFeature = (value: string) => {
    setSelectedFeatures((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const submitToHubSpot = async (emailToSubmit: string) => {
    setSubmitting(true);
    try {
      const fields = [
        { name: "email", value: emailToSubmit },
        { name: "demo_rating", value: selectedRating !== null ? RATINGS[selectedRating].value : "" },
        { name: "demo_use_case", value: Array.from(selectedUseCases).join(";") },
        { name: "demo_interested_next_topics", value: Array.from(selectedFeatures).join(";") },
        { name: "additional_feedback", value: additionalFeedback },
      ];

      await fetch(
        `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_GUID}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fields,
            context: {
              pageUri: window.location.href,
              pageName: "Zilliz Cloud Onboarding Playground",
            },
          }),
        }
      );
      setSubmitted(true);
    } catch {
      // silently fail — feedback is non-critical
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitFeedback = () => {
    if (submitting || submitted) return;
    // Fall back to the modal if we have no email or a malformed one.
    if (!isValidEmail(email)) {
      setShowEmailModal(true);
      return;
    }
    submitToHubSpot(email.trim());
  };

  const handleEmailModalSubmit = () => {
    if (!isValidEmail(manualEmail)) return;
    setShowEmailModal(false);
    submitToHubSpot(manualEmail.trim());
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
                className={`group flex-1 cursor-pointer rounded-[12px] p-[1.5px] text-center transition-all ${
                  selectedRating === i
                    ? "bg-gradient-to-l from-[#FF058A] via-[#B92BBA] to-[#531AEE]"
                    : "bg-stroke-1 hover:bg-[linear-gradient(270deg,#FF058A,#B92BBA,#531AEE)]"
                }`}
              >
                <div className="rounded-[10.5px] bg-white p-4">
                  <div className="text-2xl">{r.emoji}</div>
                  <div className={`mt-1.5 text-[12px] font-medium ${selectedRating === i ? "text-[#161a23]" : "text-[#3d4659]"}`}>{r.label}</div>
                </div>
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
                  key={uc.value}
                  onClick={() => toggleUseCase(uc.value)}
                  className={`group cursor-pointer rounded-[10px] p-[1.5px] transition-all ${
                    selectedUseCases.has(uc.value)
                      ? "bg-gradient-to-l from-[#FF058A] via-[#B92BBA] to-[#531AEE]"
                      : "bg-stroke-1 hover:bg-[linear-gradient(270deg,#FF058A,#B92BBA,#531AEE)]"
                  }`}
                >
                  <span
                    className={`block rounded-[8.5px] bg-white px-3 py-1.5 text-[12.5px] font-medium ${
                      selectedUseCases.has(uc.value) ? "text-[#161a23]" : "text-[#4d5870]"
                    }`}
                  >
                    {uc.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Next features */}
          <div className="mt-6 border-t border-[rgba(22,26,35,0.06)] pt-5">
            <div className="mb-2.5 text-[13px] font-medium text-[#161a23]">What do you want to see next?</div>
            <div className="grid grid-cols-2 gap-2">
              {NEXT_FEATURES.map((f) => (
                <div
                  key={f.value}
                  className={`group rounded-[10px] p-[1.5px] transition-all ${
                    selectedFeatures.has(f.value)
                      ? "bg-gradient-to-l from-[#FF058A] via-[#B92BBA] to-[#531AEE]"
                      : "bg-stroke-1 hover:bg-[linear-gradient(270deg,#FF058A,#B92BBA,#531AEE)]"
                  }`}
                >
                  <label className="flex cursor-pointer items-center gap-2 rounded-[8.5px] bg-white px-3 py-2.5">
                    <ZCheck
                      checked={selectedFeatures.has(f.value)}
                      onChange={() => toggleFeature(f.value)}
                    />
                    <span className="text-[12.5px] text-[#2c3343]">{f.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Additional feedback */}
          <div className="mt-6 border-t border-[rgba(22,26,35,0.06)] pt-5">
            <div className="mb-2.5 text-[13px] font-medium text-[#161a23]">Additional feedback</div>
            <textarea
              value={additionalFeedback}
              onChange={(e) => setAdditionalFeedback(e.target.value)}
              placeholder="Anything else you'd like to share..."
              className="w-full resize-none rounded-lg border border-[rgba(22,26,35,0.12)] px-3 py-2.5 text-[13px] text-[#161a23] placeholder-[#8592a8] outline-none transition focus:border-[#2cb7ff] focus:ring-1 focus:ring-[#2cb7ff]"
              rows={3}
            />
          </div>

          <button
            onClick={handleSubmitFeedback}
            disabled={submitting || submitted}
            className={`mt-5 w-full cursor-pointer rounded-xl px-4 py-3 text-[14px] font-semibold text-white transition-all ${
              submitted
                ? "bg-[#10b981]"
                : submitting
                  ? "bg-blue-1 opacity-60"
                  : "bg-blue-1 hover:bg-blue-dark-1"
            }`}
          >
            {submitted ? "Thanks for your feedback!" : submitting ? "Submitting..." : "Submit feedback"}
          </button>

          {/* Download code */}
          <a
            href="https://assets.zilliz.com/my_first_rag_a6185e441b.zip"
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
          <div className="mt-4 flex flex-col">
            {([
              { href: "https://docs.zilliz.com/docs", title: "Full Documentation", desc: "Complete guide from getting started to production" },
              { href: "https://discord.com/invite/8uyFbECzPX", title: "Join Discord", desc: "Zilliz team + developer community, instant support" },
              { href: "https://zilliz.com/contact-sales", title: "Get help going to production", desc: "Contact experts for a free consultation" },
            ] as const).map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-baseline gap-2 py-1.5 text-[13.5px] text-blue-1 transition hover:text-blue-dark-1"
              >
                <span className="font-medium underline-offset-2 group-hover:underline">
                  {link.title}
                </span>
                <span className="text-[11.5px] text-[#64718a]">{link.desc}</span>
                <ArrowRightIcon size={14} color="currentColor" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Email modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-[16px] font-semibold text-[#0a0d14]">Enter your email</h3>
            <p className="mt-1 text-[13px] text-[#64718a]">
              We need your email to submit feedback. If you prefer not to share it, you can skip.
            </p>
            <input
              type="email"
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailModalSubmit()}
              placeholder="you@example.com"
              className={`mt-4 w-full rounded-lg border px-3 py-2.5 text-[13px] text-[#161a23] placeholder-[#8592a8] outline-none transition focus:ring-1 ${
                manualEmail.trim() && !isValidEmail(manualEmail)
                  ? "border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]"
                  : "border-[rgba(22,26,35,0.12)] focus:border-[#2cb7ff] focus:ring-[#2cb7ff]"
              }`}
              autoFocus
            />
            {manualEmail.trim() && !isValidEmail(manualEmail) && (
              <p className="mt-1.5 text-[12px] text-[#ef4444]">
                Please enter a valid email address.
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowEmailModal(false)}
                className="flex-1 cursor-pointer rounded-lg border border-[rgba(22,26,35,0.12)] px-4 py-2 text-[13px] font-medium text-[#3d4659] transition hover:bg-[#f5f6f8]"
              >
                Skip
              </button>
              <button
                onClick={handleEmailModalSubmit}
                disabled={!isValidEmail(manualEmail)}
                className="flex-1 cursor-pointer rounded-lg bg-blue-1 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-blue-dark-1 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
