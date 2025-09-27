// frontend/components/wallet/TransactionRow.tsx
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch, ENDPOINTS } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Props = {
  txn: any;
  isAdmin?: boolean;
  onDispute?: (auditUid: string) => void;
};

export default function TransactionRow({ txn, isAdmin = false, onDispute }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const created = new Date(txn.created_at).toLocaleString();

  async function requestRefund() {
    try {
      setLoading(true);
      await apiFetch(`${ENDPOINTS.wallet.refunds}${txn.id}/approve/`, { method: "POST" });
      toast({ 
        title: "Refund successful", 
        description: `Refund issued for txn ${txn.reference || txn.uid}` 
      });
    } catch (err: any) {
      toast({ 
        title: "Refund failed", 
        description: err?.payload?.detail || err.message 
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded-md p-3 flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="text-sm text-slate-700">{txn.channel}</div>
        <div className="font-medium">{txn.gross_amount || txn.amount} NGN</div>
        <div className="text-xs text-slate-500">Ref: {txn.reference || txn.uid}</div>
        <div className="text-xs text-slate-400 mt-1">Created: {created}</div>
      </div>

      <div className="text-right flex flex-col items-end gap-2">
        <div className="text-sm">Fee: <span className="font-semibold">{txn.fee_amount || 0}</span></div>
        <div className="text-sm">Net: <span className="font-semibold">{txn.net_amount || txn.amount}</span></div>
        <div className="text-xs text-slate-500">{txn.status}</div>
        
        <div className="flex gap-2 mt-1">
          {onDispute && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDispute(txn.uid)}
            >
              Dispute
            </Button>
          )}
          
          {isAdmin && txn.type !== "refund" && (
            <Button 
              onClick={requestRefund} 
              disabled={loading} 
              size="sm" 
              variant="destructive"
            >
              {loading ? "Processing..." : "Refund"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
