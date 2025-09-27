// frontend/components/admin/DisputeAdmin.tsx
"use client";
import React, { useEffect, useState, useCallback } from "react";
import { apiFetch, ENDPOINTS } from "~/lib/api";
import DisputeTable from "./DisputeTable";
import DisputeDetailModal from "./DisputeDetailModal";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useToast } from "~/hooks/use-toast";
import { formatISO } from "date-fns";
import exportToCsv, { exportToExcelHtml } from "~/lib/export";

type Dispute = {
  id: number;
  uid: string;
  raised_by: number;
  raised_by_name: string;
  wallet_transaction: number | null;
  wallet_transaction_uid?: string;
  payment_reference?: string | null;
  amount?: string | null;
  reason: string;
  status: string;
  created_at: string;
};

export default function DisputeAdmin() {
  const { toast } = useToast();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [count, setCount] = useState<number>(0);
  const [filters, setFilters] = useState({
    status: "",
    user_email: "",
    start_date: "",
    end_date: "",
    search: "",
  });
  const [selected, setSelected] = useState<Dispute | null>(null);

  const base = ENDPOINTS?.wallet?.base ?? "/api/wallets/";
  const disputesEndpoint = `${base}disputes/`;

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        page_size: pageSize,
      };
      if (filters.status) params.status = filters.status;
      if (filters.user_email) params.raised_by_email = filters.user_email;
      if (filters.search) params.search = filters.search;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;

      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") query.append(k, String(v));
      });
      const url = `${disputesEndpoint}?${query.toString()}`;
      const data = await apiFetch(url);
      // assume DRF pagination with results, count
      setDisputes(data.results || data);
      setCount(data.count ?? (data.results ? data.results.length : data.length));
    } catch (err: any) {
      toast({ title: "Failed to load disputes", description: err?.payload?.detail || err.message });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters, toast, disputesEndpoint]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  function onOpenDetail(d: Dispute) {
    setSelected(d);
  }

  function onCloseDetail() {
    setSelected(null);
  }

  async function onResolve(refetch = true, payload?: any) {
    if (!selected) return;
    try {
      const url = `${disputesEndpoint}${selected.id}/resolve/`;
      const res = await apiFetch(url, {
        method: "POST",
        body: JSON.stringify(payload || { action: "accept", note: "" }),
      });
      toast({ title: "Resolved", description: "Dispute resolved." });
      if (refetch) fetchList();
      setSelected(null);
    } catch (err: any) {
      toast({ title: "Resolve failed", description: err?.payload?.detail || err.message });
    }
  }

  async function onRefund(payload?: any) {
    if (!selected) return;
    try {
      const url = `${disputesEndpoint}${selected.id}/refund/`;
      const res = await apiFetch(url, {
        method: "POST",
        body: JSON.stringify(payload || {}),
      });
      toast({ title: "Refund issued", description: "Refund processed successfully." });
      fetchList();
      setSelected(null);
    } catch (err: any) {
      toast({ title: "Refund failed", description: err?.payload?.detail || err.message });
    }
  }

  async function onComment(text: string, internal = false) {
    if (!selected) return;
    try {
      const url = `${disputesEndpoint}${selected.id}/comment/`;
      const res = await apiFetch(url, {
        method: "POST",
        body: JSON.stringify({ comment: text, internal }),
      });
      toast({ title: "Comment added" });
      fetchList();
    } catch (err: any) {
      toast({ title: "Comment failed", description: err?.payload?.detail || err.message });
    }
  }

  function handleExportCsv() {
    if (!disputes.length) {
      toast({ title: "No data to export" });
      return;
    }
    const rows = disputes.map((d) => ({
      UID: d.uid,
      User: d.raised_by_name,
      TXN: d.wallet_transaction_uid || "",
      Reference: d.payment_reference || "",
      Amount: String(d.amount || ""),
      Reason: d.reason,
      Status: d.status,
      Created: d.created_at,
    }));
    exportToCsv(rows, `disputes-page-${page}.csv`);
  }

  function handleExportExcel() {
    if (!disputes.length) {
      toast({ title: "No data to export" });
      return;
    }
    // create simple HTML table for Excel (.xls) compatibility
    const headers = ["UID", "User", "TXN", "Reference", "Amount", "Reason", "Status", "Created"];
    const rows = disputes.map((d) => [
      d.uid,
      d.raised_by_name,
      d.wallet_transaction_uid || "",
      d.payment_reference || "",
      String(d.amount || ""),
      d.reason,
      d.status,
      d.created_at,
    ]);
    exportToExcelHtml(headers, rows, `disputes-page-${page}.xls`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end">
        <div className="w-48">
          <label className="block text-sm mb-1">Status</label>
          <select
            className="w-full border rounded p-2"
            value={filters.status}
            onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}
          >
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="under_review">Under review</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div className="w-72">
          <label className="block text-sm mb-1">User email</label>
          <Input
            placeholder="user@example.com"
            value={filters.user_email}
            onChange={(e: any) => setFilters((s) => ({ ...s, user_email: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Date from</label>
          <input
            type="date"
            className="border rounded p-2"
            value={filters.start_date}
            onChange={(e) => setFilters((s) => ({ ...s, start_date: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Date to</label>
          <input
            type="date"
            className="border rounded p-2"
            value={filters.end_date}
            onChange={(e) => setFilters((s) => ({ ...s, end_date: e.target.value }))}
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm mb-1">Search</label>
          <Input
            placeholder="Search uid, reason, reference, user..."
            value={filters.search}
            onChange={(e: any) => setFilters((s) => ({ ...s, search: e.target.value }))}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => {
              setPage(1);
              fetchList();
            }}
          >
            Apply
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setFilters({ status: "", user_email: "", start_date: "", end_date: "", search: "" });
              setPage(1);
            }}
          >
            Reset
          </Button>
        </div>

        <div className="ml-auto flex gap-2">
          <Button onClick={handleExportCsv}>Export CSV</Button>
          <Button onClick={handleExportExcel}>Export Excel</Button>
        </div>
      </div>

      <DisputeTable
        disputes={disputes}
        loading={loading}
        onOpenDetail={onOpenDetail}
        page={page}
        pageSize={pageSize}
        setPage={setPage}
        setPageSize={setPageSize}
        count={count}
      />

      {selected && (
        <DisputeDetailModal
          disputeId={selected.id}
          onClose={onCloseDetail}
          onResolve={onResolve}
          onRefund={onRefund}
          onAddComment={onComment}
        />
      )}
    </div>
  );
}
