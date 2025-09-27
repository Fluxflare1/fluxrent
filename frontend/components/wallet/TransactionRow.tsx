// frontend/components/wallet/TransactionRow.tsx
"use client";
import React from "react";

type Props = {
  txn: any;
  onDispute?: (auditUid: string) => void;
};

export default function TransactionRow({ txn, onDispute }: Props) {
  const created = new Date(txn.created_at).toLocaleString();
  return (
    <div className="border rounded-md p-3 flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="text-sm text-slate-700">{txn.channel}</div>
        <div className="font-medium">{txn.gross_amount} NGN</div>
        <div className="text-xs text-slate-500">Ref: {txn.reference || txn.uid}</div>
        <div className="text-xs text-slate-400 mt-1">Created: {created}</div>
      </div>

      <div className="text-right">
        <div className="text-sm">Fee: <span className="font-semibold">{txn.fee_amount}</span></div>
        <div className="text-sm">Net: <span className="font-semibold">{txn.net_amount}</span></div>
        <div className="text-xs mt-2 text-slate-500">{txn.status}</div>
        {onDispute ? (
          <button
            className="mt-2 inline-block text-sm px-3 py-1 border rounded hover:bg-slate-100"
            onClick={() => onDispute(txn.uid)}
          >
            Dispute
          </button>
        ) : null}
      </div>
    </div>
  );
}
