const STEPS = ["Data", "Chunk", "Tags", "Vector", "Ingest", "Search", "Export"];

interface StepProgressProps {
  currentStep: number; // 0-based
}

export function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <div className="mt-5 flex items-center gap-2">
      {STEPS.map((label, i) => {
        const isDone = i < currentStep;
        const isCurrent = i === currentStep;

        return (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div className="flex shrink-0 items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  i <= currentStep
                    ? "bg-blue-1 text-white"
                    : "bg-black-4 text-black-3"
                }`}
              >
                {isDone ? (
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`hidden text-sm lg:inline ${
                  i <= currentStep
                    ? "font-medium text-black-1"
                    : "text-black-3"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px flex-1 ${
                  isDone ? "bg-blue-1" : "bg-stroke-1"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
