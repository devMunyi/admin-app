import { TabButtonProps } from "./type";

export const TabButton: React.FC<TabButtonProps> = ({
    label,
    icon,
    isActive,
    onClick,
}) => {
    return (
        <button
            className={`inline-flex items-center gap-2 border-b-2 px-2.5 py-2 text-sm font-medium transition-colors duration-200 ${isActive
                ? "text-brand-500 border-brand-500 dark:text-brand-400 dark:border-brand-400"
                : "text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
            onClick={onClick}
        >
            {icon}
            {label}
        </button>
    );
};