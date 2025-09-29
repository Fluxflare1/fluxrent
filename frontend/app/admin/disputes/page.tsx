"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Download, CheckCircle, Search } from "lucide-react";
import axios from "axios";

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    fetchDisputes();
  }, [status, search, dateRange, page]);

  async function fetchDisputes() {
    setLoading(true);
    try {
      const res = await axios.get(`/api/disputes/`, {
        params: {
          status,
          search,
          start_date: dateRange?.start,
          end_date: dateRange?.end,
          page,
        },
      });
      setDisputes(res.data.results);
      setTotalPages(res.data.total_pages);
    } finally {
      setLoading(false);
    }
  }

  async function bulkResolve() {
    await axios.post(`/api/disputes/bulk_resolve/`, { ids: selectedIds });
    fetchDisputes();
    setSelectedIds([]);
  }

  async function exportCSV() {
    window.open(`/api/disputes/export_csv/`);
  }

  async function exportExcel() {
    window.open(`/api/disputes/export_excel/`);
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Dispute Management</h1>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Select onValueChange={(val) => setStatus(val)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search by user/email/ref"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />

        <DatePicker onChange={(range) => setDateRange(range)} />

        <Button onClick={fetchDisputes}>
          <Search className="w-4 h-4 mr-2" /> Search
        </Button>
      </div>

      {/* Bulk Actions */}
      <div className="flex gap-2">
        <Button onClick={bulkResolve} disabled={!selectedIds.length}>
          <CheckCircle className="w-4 h-4 mr-2" /> Bulk Resolve
        </Button>
        <Button onClick={exportCSV}>
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
        <Button onClick={exportExcel}>
          <Download className="w-4 h-4 mr-2" /> Export Excel
        </Button>
      </div>

      {/* DataTable */}
      <Card>
        <CardContent>
          <DataTable
            data={disputes}
            loading={loading}
            onRowSelect={(ids) => setSelectedIds(ids)}
            pagination={{
              page,
              totalPages,
              onPageChange: setPage,
            }}
            columns={[
              { key: "id", label: "ID" },
              { key: "user.username", label: "User" },
              { key: "transaction.reference", label: "Transaction" },
              { key: "status", label: "Status" },
              { key: "created_at", label: "Created" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}




// in frontend/app/admin/disputes/page.tsx (client part)
"use client";
import DisputeSSE from "@/components/admin/DisputeSSE";
export default function AdminDisputesPageClientWrapper() {
  return (
    <>
      <DisputeSSE />
      {/* existing admin UI... */}
    </>
  );
}





useEffect(() => {
  const socket = new WebSocket("wss://your-domain/ws/disputes/");

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // show toast notification for new dispute
    toast({
      title: "New Dispute",
      description: `Dispute #${data.id} by ${data.user}`,
    });
    // refresh disputes list
    fetchDisputes();
  };

  return () => socket.close();
}, []);
