// components/ui/Spinner.tsx
import React from "react";

interface SpinnerProps {
    size?: "xs" | "sm" | "md" | "lg";
    color?: "primary" | "white" | "gray";
    className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
    size = "md",
    color = "primary",
    className = "",
}) => {
    const sizeClasses = {
        xs: "h-4 w-4 border-2",
        sm: "h-5 w-5 border-2",
        md: "h-8 w-8 border-b-2",
        lg: "h-10 w-10 border-b-2",
    };

    const colorClasses = {
        primary: "border-brand-500",
        white: "border-white",
        gray: "border-gray-400",
    };

    return (
        <div
            className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
            aria-label="Loading"
            role="status"
        />
    );
};

export default Spinner;