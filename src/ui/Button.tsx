import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

const base =
  "inline-flex items-center justify-center font-semibold rounded transition-colors focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer";

const variants: Record<Variant, string> = {
  primary: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
  secondary: "bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-800",
  danger: "bg-red-900 text-red-200 hover:bg-red-800",
  ghost: "bg-transparent text-gray-300 hover:bg-gray-700",
};

const sizes = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
