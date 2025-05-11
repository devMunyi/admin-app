import React from "react";
import clsx from "clsx";

type BadgeVariant = "light" | "solid" | "outline";
type BadgeSize = "sm" | "md";
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  rounded?: "sm" | "md" | "lg" | "full";
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  variant = "light",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  className,
  ariaLabel,
  rounded = "full",
  children,
}) => {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 justify-center gap-1 font-medium transition-colors duration-200";

  const sizeStyles = {
    sm: "text-xs",
    md: "text-sm",
  };

  const roundedStyles = {
    sm: "rounded-xs",
    md: "rounded-xs",
    lg: "rounded-xs",
    full: "rounded-full",
  };

  const variants = {
    outline: {
      primary: "border border-brand-500 text-brand-500 dark:border-brand-400 dark:text-brand-400",
      success: "border border-success-500 text-success-500 dark:border-success-400 dark:text-success-400",
      error: "border border-error-500 text-error-500 dark:border-error-400 dark:text-error-400",
      warning: "border border-warning-500 text-warning-500 dark:border-warning-400 dark:text-warning-400",
      info: "border border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400",
      light: "border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200",
      dark: "border border-gray-700 text-gray-700 dark:border-gray-300 dark:text-gray-300",
    },
    light: {
      primary: "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400",
      success: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
      error: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500",
      warning: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400",
      info: "bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500",
      light: "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80",
      dark: "bg-gray-500 text-white dark:bg-white/5 dark:text-white",
    },
    solid: {
      primary: "bg-brand-500 text-white dark:text-white",
      success: "bg-success-500 text-white dark:text-white",
      error: "bg-error-500 text-white dark:text-white",
      warning: "bg-warning-500 text-white dark:text-white",
      info: "bg-blue-light-500 text-white dark:text-white",
      light: "bg-gray-400 dark:bg-white/5 text-white dark:text-white/80",
      dark: "bg-gray-700 text-white dark:text-white",
    },
  };

  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <span
      className={clsx(
        baseStyles,
        sizeStyles[size],
        variants[variant][color], // Now safely accesses lowercase keys
        roundedStyles[rounded],
        className
      )}
      aria-label={ariaLabel}
      role="status"
    >
      {startIcon && <span className={`mr-1 ${iconSize}`}>{startIcon}</span>}
      {children}
      {endIcon && <span className={`ml-1 ${iconSize}`}>{endIcon}</span>}
    </span>
  );
};

export default React.memo(Badge);