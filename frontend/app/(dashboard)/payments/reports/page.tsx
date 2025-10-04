"use client";
import ReportsTable from "@/components/payments/ReportsTable";
import TenantStatement from "@/components/payments/TenantStatement";

export default function ReportsPage() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Payment Reports</h1>
      <ReportsTable />
      <TenantStatement />
    </div>
  );
}
