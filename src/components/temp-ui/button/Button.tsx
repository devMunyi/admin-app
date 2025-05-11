import React, { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  size?: "sm" | "md";
  variant?: "primary" | "outline";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  title?: string;
};

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  title = "",
}) => {
  // Base button classes - only structural styles
  const baseClasses = "inline-flex items-center justify-center font-medium gap-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  // Size Classes - only padding and font size
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-base",
  };

  // Variant Classes - only variant-specific styles (without colors that should be customizable)
  const variantClasses = {
    primary: "border border-transparent shadow-sm",
    outline: "border bg-transparent",
  };

  // Color Classes - default colors that can be overridden
  const colorClasses = {
    primary: "bg-brand-500 text-white hover:bg-brand-600 disabled:bg-brand-300",
    outline: "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700",
  };

  // Disabled state
  const disabledClasses = disabled ? "cursor-not-allowed opacity-70" : "";

  return (
    <button
      title={title}
      className={[
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        !className?.includes("bg-") && colorClasses[variant], // Only apply default colors if not overridden
        disabledClasses,
        className, // Custom classes come last to override defaults
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;