"use client";
import WalletCard from "@/components/payments/WalletCard";
import PaymentHistoryTable from "@/components/payments/PaymentHistoryTable";

export default function PaymentsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Payments</h1>
      <WalletCard />
      <PaymentHistoryTable />
    </div>
  );
}
