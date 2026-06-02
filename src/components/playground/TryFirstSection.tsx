import { useState } from "react";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";
import { Tag } from "@/components/ui/Tag";

interface TryFirstSectionProps {
  onStart: () => void;
}

const SAMPLE_QUESTIONS = [
  {
    tag: "Recommended",
    question: "How does RAG affect grounded satire generation?",
    answer:
      "RAG helps grounded satire generation by conditioning the LLM on retrieved current news, giving the satire factual and contextual grounding. In the cited work, it is used to generate satirical dictionary definitions in the Finnish context. However, RAG can also introduce risks because retrieved corpus entries may steer outputs if they contain poisoned or misleading content.",
    sources: [
      "arxiv_papers.step2-source.md · chunk 17",
      "arxiv_papers.step2-source.md · chunk 16",
      "arxiv_papers.step2-source.md · chunk 2238",
    ],
  },
  {
    tag: "Long-context",
    question: "How do hard distractors affect long-context reasoning?",
    answer:
      'Hard distractors sharply degrade long-context reasoning even when present in small proportions. They capture disproportionate attention, causing a nonlinear "First Drop of Ink" effect: performance drops steeply early, then declines only marginally as more hard distractors are added. Substantial recovery requires reducing the hard-distractor proportion to near zero, emphasizing the need for high-precision retrieval.',
    sources: [
      "arxiv_papers.step2-source.md · chunk 27",
      "arxiv_papers.step2-source.md · chunk 25",
      "arxiv_papers.step2-source.md · chunk 26",
    ],
  },
  {
    tag: "KGQA",
    question: "How does PathISE use retrieval-augmented generation for KGQA?",
    answer:
      "PathISE follows the KGQA retrieval-augmented generation paradigm by grounding LLMs with structured knowledge retrieved from knowledge graphs — specifically question-relevant evidence such as paths or subgraphs. It aims to provide reusable supervision signals for evidence retrieval and improves KGQA performance without relying on costly LLM-refined supervision. The provided context does not give more detailed mechanics.",
    sources: [
      "arxiv_papers.step2-source.md · chunk 34",
      "arxiv_papers.step2-source.md · chunk 36",
      "arxiv_papers.step2-source.md · chunk 3204",
    ],
  },
];

export function TryFirstSection({ onStart }: TryFirstSectionProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<number>(0);

  const result = SAMPLE_QUESTIONS[selectedQuestion];

  return (
    <section className="animate-[rise_500ms_cubic-bezier(.2,.7,.2,1)_both]">
      <div className="overflow-hidden rounded-2xl border border-[rgba(22,26,35,0.06)] bg-white shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)]">
        <div className="grid grid-cols-12 gap-0">
          {/* LEFT PANEL */}
          <div className="col-span-12 flex flex-col justify-between border-b border-[rgba(22,26,35,0.06)] bg-gradient-to-br from-[rgba(239,249,255,0.9)] via-white to-white p-6 lg:col-span-5 lg:border-b-0 lg:border-r">
            <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-[#0a0d14]">
              Try First
            </h1>

            <p className="mt-3 max-w-[440px] text-[14px] leading-relaxed text-[#64718a]">
              Experience a real RAG pipeline first: Zilliz Cloud retrieves
              relevant passages, then a model generates answers from them.
              <a
                href="https://docs.zilliz.com/docs/single-vector-search"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 inline-flex items-center gap-[3px] whitespace-nowrap text-[11.5px] font-medium text-blue-1 no-underline hover:text-blue-dark-1 hover:underline hover:[text-underline-offset:3px]"
              >
                Vector search docs
                <ArrowRightIcon size={12} />
              </a>
            </p>

            <div className="mt-5">
              <button
                onClick={onStart}
                className="cursor-pointer rounded-lg bg-blue-1 px-5 py-2.5 text-[13px] font-medium text-white transition-all hover:bg-blue-dark-1"
              >
                Start Step 1
              </button>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="col-span-12 p-6 lg:col-span-7">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-[12px] font-medium text-[#3d4659]">
                  Try RAG in 30 seconds
                </div>
                <div className="mt-0.5 text-[11.5px] text-[#8592a8]">
                  Pick a question, see the answer and cited passages instantly
                </div>
              </div>
            </div>

            {/* QUESTION CARDS */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {SAMPLE_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedQuestion(i)}
                  className={`group min-h-[72px] cursor-pointer rounded-[12px] p-[1.5px] text-left transition-all ${
                    selectedQuestion === i
                      ? "bg-gradient-to-l from-[#FF058A] via-[#B92BBA] to-[#531AEE]"
                      : "bg-stroke-1 hover:bg-[linear-gradient(270deg,#FF058A,#B92BBA,#531AEE)]"
                  }`}
                >
                  <div className="h-full rounded-[10.5px] bg-white px-3 py-2.5">
                    <div
                      className={`font-mono text-[10px] uppercase tracking-[0.1em] ${
                        selectedQuestion === i
                          ? "text-blue-1"
                          : "text-black-3"
                      }`}
                    >
                      {q.tag}
                    </div>
                    <div className={`mt-1 text-[12px] font-medium leading-snug ${selectedQuestion === i ? "text-black-1" : "text-black-2"}`}>
                      {q.question}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* RESULT PREVIEW */}
            <div className="mt-4 overflow-hidden rounded-xl border border-[rgba(22,26,35,0.06)] bg-[rgba(246,247,249,0.45)]">
              <div className="flex items-center justify-between border-b border-[rgba(22,26,35,0.06)] px-4 py-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#8592a8]">
                  Result preview
                </span>
                {result && (
                  <span className="font-mono text-[11px] text-[#059669]">
                    done
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="text-[13px] leading-relaxed text-[#3d4659]">
                  {result.answer}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {result.sources.map((source, i) => (
                    <Tag key={i} label={source} variant="info" size="small" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
