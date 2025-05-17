import { TabContentProps } from "@/lib/types";

export const TabContent: React.FC<TabContentProps> = ({ children, isActive }) => {
    if (!isActive) return null;

    return <div className="mt-4">{children}</div>;
};