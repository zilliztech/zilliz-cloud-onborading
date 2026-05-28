import { ReactNode } from "react";

interface TagProps {
  label: ReactNode;
  variant?: "info" | "success" | "warning" | "error" | "default";
  size?: "xs" | "small" | "medium";
}

const VARIANT_STYLES: Record<string, string> = {
  info: "bg-blue-4 text-blue-dark-2 border-blue-3",
  success: "bg-green-4 text-green-1 border-green-3",
  warning: "bg-yellow-4 text-yellow-1 border-yellow-3",
  error: "bg-red-4 text-red-1 border-red-3",
  default: "bg-black-4 text-black-2 border-stroke-1",
};

const SIZE_STYLES: Record<string, string> = {
  xs: "px-1.5 py-0 text-[10px]",
  small: "px-2 py-0.5 text-[11px]",
  medium: "px-2.5 py-1 text-[12px]",
};

export function Tag({ label, variant = "default", size = "small" }: TagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]}`}
    >
      {label}
    </span>
  );
}
