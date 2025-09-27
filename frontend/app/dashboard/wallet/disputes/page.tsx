// frontend/app/dashboard/wallet/disputes/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import TransactionRow from "@/components/wallet/TransactionRow";
import DisputeModal from "@/components/wallet/DisputeModal";
import { apiFetch, ENDPOINTS } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function WalletDisputesPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  async function load() {
    try {
      const data = await apiFetch(ENDPOINTS.finance.audits + "?page_size=50");
      setAudits(data.results || data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Your Transactions</h2>
      <div className="space-y-3">
        {audits.map((a) => (
          <TransactionRow
            key={a.uid}
            txn={a}
            onDispute={(uid) => {
              setSelected(uid);
              setShowModal(true);
            }}
          />
        ))}
      </div>

      {showModal && selected ? (
        <DisputeModal
          auditUid={selected}
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setSelected(null);
            load();
          }}
        />
      ) : null}
    </div>
  );
}
