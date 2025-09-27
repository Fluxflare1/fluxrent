"use client";
import { useEffect, useState } from "react";
import { apiFetch, ENDPOINTS } from "@/lib/api";

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<any[]>([]);

  useEffect(() => {
    apiFetch(ENDPOINTS.wallet.refunds).then(setRefunds).catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Refunds</h1>
      <div className="space-y-3">
        {refunds.map((r) => (
          <div key={r.id} className="border rounded-lg p-3 shadow-sm">
            <div className="flex justify-between">
              <div>
                <div className="font-mono text-sm">Txn: {r.transaction_ref}</div>
                <div className="text-sm">Amount: ₦{r.total_refund}</div>
                <div className="text-sm">Status: {r.status}</div>
              </div>
              {r.auto_generated && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">Auto</span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Hold until: {r.hold_until ? new Date(r.hold_until).toLocaleString() : "N/A"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
