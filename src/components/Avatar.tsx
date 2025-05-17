// src/components/Avatar.tsx
import React from "react";
import Image from "next/image";
import AvatarText from "./temp-ui/avatar/AvatarText";

type AvatarProps = {
    src?: string | null;
    alt?: string;
    name: string;
    className?: string;
    imageClassName?: string;
    size?: "sm" | "md" | "lg" | "xl";
    width?: number;
    height?: number;
    fontSize?: number | string;
}

const sizeClasses = {
    sm: { class: "h-8 w-8", size: 32 },
    md: { class: "h-10 w-10", size: 40 },
    lg: { class: "h-12 w-12", size: 48 },
    xl: { class: "h-16 w-16", size: 64 },
};

const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
};

const Avatar: React.FC<AvatarProps> = ({
    src,
    alt = "User avatar",
    name,
    className = "",
    imageClassName = "",
    size = "md",
    width,
    height,
    fontSize,
}) => {
    const calculatedWidth = width || sizeClasses[size].size;
    const calculatedHeight = height || sizeClasses[size].size;

    if (!src) {
        return (
            <AvatarText
                name={name}
                className={`${className}`}
                width={calculatedWidth}
                height={calculatedHeight}
                fontSize={fontSize}
            />
        );
    }

    return (
        <span
            className={`overflow-hidden rounded-full ${sizeClasses[size].class} ${className}`}
            style={{
                width: width ? `${width}px` : undefined,
                height: height ? `${height}px` : undefined,
            }}
        >
            <Image
                width={calculatedWidth}
                height={calculatedHeight}
                src={src}
                alt={alt}
                className={`object-cover h-full w-full ${imageClassName}`}
            />
        </span>
    );
};

export default Avatar;