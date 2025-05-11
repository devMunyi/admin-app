import React from "react";
import ComponentCard from "../../common/ComponentCard";
import DefaultTab from "./DefaultTab";
import VerticalTabs from "./VerticalTabs";
import TabWithBadge from "./TabWithBadge";
import TabWithUnderlineAndIcon from "./TabWithUnderlineAndIcon";
import TabWithUnderline from "./TabWithUnderline";

export default function TabExample() {
    return (
        <div className="space-y-5 sm:space-y-6">
            <ComponentCard title="Default Tab">
                <DefaultTab />
            </ComponentCard>
            <ComponentCard title="Tab With Underline">
                <TabWithUnderline />
            </ComponentCard>
            <ComponentCard title="Tab with line and icon">
                <TabWithUnderlineAndIcon />
            </ComponentCard>
            <ComponentCard title="Tab with badge">
                <TabWithBadge />
            </ComponentCard>
            <ComponentCard title="Vertical Tab">
                <VerticalTabs />
            </ComponentCard>
        </div>
    );
}
