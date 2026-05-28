import { ReactNode } from "react";

type Status = "pending" | "in-progress" | "done" | "error";

interface ProvisioningStatusCardProps {
  icon: ReactNode;
  title: string;
  status: Status;
  statusText: string;
}

function StatusIndicator({ status }: { status: Status }) {
  if (status === "in-progress") {
    return (
      <svg
        className="h-4 w-4 animate-spin text-blue-1"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    );
  }
  if (status === "done") {
    return (
      <svg className="h-4 w-4 text-green-1" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  if (status === "error") {
    return (
      <svg className="h-4 w-4 text-red-2" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  return <div className="h-4 w-4 rounded-full border-2 border-stroke-1" />;
}

export function ProvisioningStatusCard({
  icon,
  title,
  status,
  statusText,
}: ProvisioningStatusCardProps) {
  return (
    <div className="flex items-center justify-between rounded-badge border border-stroke-1 bg-white px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="text-black-2">{icon}</span>
        <span className="text-sm font-medium text-black-1">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <StatusIndicator status={status} />
        <span
          className={`text-sm ${
            status === "done"
              ? "text-green-1"
              : status === "error"
                ? "text-red-1"
                : status === "in-progress"
                  ? "text-blue-1"
                  : "text-black-3"
          }`}
        >
          {statusText}
        </span>
      </div>
    </div>
  );
}
