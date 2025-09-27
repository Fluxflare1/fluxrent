// frontend/components/admin/DisputeTable.tsx
"use client";
import React from "react";
import { Button } from "~/components/ui/button";

type Dispute = {
  id: number;
  uid: string;
  raised_by_name: string;
  wallet_transaction_uid?: string | null;
  payment_reference?: string | null;
  amount?: string | null;
  reason?: string;
  status?: string;
  created_at?: string;
};

export default function DisputeTable({
  disputes,
  loading,
  onOpenDetail,
  page,
  pageSize,
  setPage,
  setPageSize,
  count,
}: {
  disputes: Dispute[];
  loading: boolean;
  onOpenDetail: (d: Dispute) => void;
  page: number;
  pageSize: number;
  setPage: (p: number) => void;
  setPageSize: (s: number) => void;
  count: number;
}) {
  const totalPages = Math.max(1, Math.ceil((count || disputes.length) / pageSize));

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="text-left p-2">UID</th>
              <th className="text-left p-2">User</th>
              <th className="text-left p-2">TXN / Ref</th>
              <th className="text-left p-2">Amount</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Created</th>
              <th className="text-left p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : disputes.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center">
                  No disputes
                </td>
              </tr>
            ) : (
              disputes.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="p-2">{d.uid}</td>
                  <td className="p-2">{d.raised_by_name}</td>
                  <td className="p-2">
                    {d.wallet_transaction_uid || d.payment_reference || "—"}
                  </td>
                  <td className="p-2">{d.amount || "—"}</td>
                  <td className="p-2">
                    <span className="inline-block px-2 py-0.5 rounded text-xs bg-slate-100">
                      {d.status}
                    </span>
                  </td>
                  <td className="p-2">{d.created_at}</td>
                  <td className="p-2">
                    <Button size="sm" onClick={() => onOpenDetail(d)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label>Page size</label>
          <select
            className="border rounded p-1"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>
            Prev
          </Button>
          <div>
            Page {page} / {totalPages}
          </div>
          <Button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
