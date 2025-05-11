import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import { APP_NAME } from "@/lib/constants";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: `${APP_NAME} | branches`,
  description: `${APP_NAME} - branches`,
};

export default function BranchesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Branches" />
      <div className="space-y-6">
        <ComponentCard title="Branches 1">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
}
