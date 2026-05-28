const STEPS = [
  { id: "01", label: "Data" },
  { id: "02", label: "Chunk" },
  { id: "03", label: "Tags" },
  { id: "04", label: "Vector" },
  { id: "05", label: "Ingest" },
  { id: "06", label: "Search" },
  { id: "07", label: "Export" },
];

interface StepNavProps {
  activeStep: number;
}

export function StepNav({ activeStep }: StepNavProps) {
  return (
    <div className="flex gap-1 rounded-lg border border-[rgba(22,26,35,0.06)] bg-white p-1 shadow-[0_1px_2px_rgba(13,43,72,0.04),0_4px_12px_rgba(20,147,220,0.08)] flex-wrap">
      {STEPS.map((step, i) => {
        const isActive = i === activeStep;
        return (
          <a
            key={step.id}
            className={`cursor-pointer px-3 py-1.5 rounded-md font-mono text-[11px] tracking-[0.08em] uppercase transition ${
              isActive
                ? "bg-[#161a23] text-white"
                : "text-[#64718a] hover:text-[#161a23]"
            }`}
          >
            {step.id} · {step.label}
          </a>
        );
      })}
    </div>
  );
}
