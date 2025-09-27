// frontend/components/wallet/DisputeModal.tsx
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch, ENDPOINTS } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Props = {
  auditUid: string | null;
  onClose: () => void;
  onCreated?: () => void;
};

export default function DisputeModal({ auditUid, onClose, onCreated }: Props) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  if (!auditUid) return null;

  async function submit() {
    if (!reason) {
      toast({ title: "Enter reason", description: "Please describe why you dispute this transaction." });
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch(ENDPOINTS.finance.disputes, {
        method: "POST",
        body: JSON.stringify({
          transaction: auditUid,
          reason,
          evidence: {},
        }),
      });
      toast({ title: "Dispute submitted", description: "Our support team will investigate." });
      onCreated?.();
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err?.payload?.detail || err.message || "Failed to submit" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl">
        <h3 className="text-lg font-semibold">Dispute Transaction</h3>
        <p className="text-sm text-slate-500 mt-1">Transaction: {auditUid}</p>

        <textarea
          rows={6}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border rounded p-2 mt-3"
          placeholder="Describe the issue and attach evidence (optional)"
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Dispute"}
          </Button>
        </div>
      </div>
    </div>
  );
}
