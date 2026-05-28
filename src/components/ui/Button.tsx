import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "success" | "danger" | "ghost";
  size?: "small" | "medium";
  loading?: boolean;
  children: ReactNode;
}

const VARIANT_STYLES: Record<string, string> = {
  primary: "bg-blue-1 text-white hover:bg-blue-dark-1",
  success: "bg-green-2 text-green-1",
  danger: "bg-red-2 text-white",
  ghost: "bg-white text-black-2 border border-stroke-1 hover:border-blue-1 hover:text-blue-1",
};

const SIZE_STYLES: Record<string, string> = {
  small: "px-3 py-1.5 text-[12px]",
  medium: "px-4 py-2 text-[13px]",
};

export function Button({
  variant = "primary",
  size = "medium",
  loading = false,
  disabled,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg font-semibold transition-all ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${isDisabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
      {...rest}
    >
      {loading && (
        <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
