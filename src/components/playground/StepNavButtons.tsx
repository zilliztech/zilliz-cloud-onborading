import { ArrowRightIcon, ArrowLeftIcon } from "@/components/icons/ArrowRightIcon";

interface StepNavButtonsProps {
  prevLabel?: string;
  prevAnchor?: string;
  nextLabel?: string;
  onNext?: () => void;
  /** Disables the Next button until the current step is complete. */
  nextDisabled?: boolean;
  /** Hint shown next to a disabled Next button explaining how to unlock it. */
  nextHint?: string;
}

export function StepNavButtons({
  prevLabel,
  prevAnchor,
  nextLabel,
  onNext,
  nextDisabled = false,
  nextHint,
}: StepNavButtonsProps) {
  return (
    <div className="mt-6 flex items-center justify-between">
      {prevLabel && prevAnchor ? (
        <a
          href={prevAnchor}
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[rgba(22,26,35,0.12)] bg-white px-4 py-2.5 text-[13px] font-medium text-black-2 shadow-[0_1px_2px_rgba(13,43,72,0.04)] transition hover:border-blue-1 hover:text-blue-1"
        >
          <ArrowLeftIcon size={14} />
          {prevLabel}
        </a>
      ) : (
        <div />
      )}
      {nextLabel && onNext && (
        <div className="flex items-center gap-3">
          {nextDisabled && nextHint && (
            <span className="text-[12px] text-[#8592a8]">{nextHint}</span>
          )}
          <button
            onClick={onNext}
            disabled={nextDisabled}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-1 px-5 py-2.5 text-[13px] font-medium text-white transition-all hover:bg-blue-dark-1 disabled:cursor-not-allowed disabled:bg-[#c7ced9] disabled:hover:bg-[#c7ced9]"
          >
            {nextLabel}
            <ArrowRightIcon size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
