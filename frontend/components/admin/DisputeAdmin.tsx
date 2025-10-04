// frontend/components/admin/DisputeAdmin.tsx
"use client";

import React, { useEffect, useState } from "react";
import api, { ENDPOINTS } from "@/lib/api";
import { Button } from "@/components/ui/button"; // ← Named import
import { Input } from "@/components/ui/input";   // ← Named import
import { useToast } from "@/hooks/use-toast";
import { exportToCSV } from "@/lib/export";

interface Dispute {
  id: number;
  user: string;
  description: string;
  status: string;
  created_at: string;
}

export default function DisputeAdmin() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchDisputes() {
      setLoading(true);
      try {
        const res = await api.get(ENDPOINTS.finance.disputes);
        setDisputes(res.data);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load disputes",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchDisputes();
  }, [toast]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Disputes</h2>
        <Button onClick={() => exportToCSV(disputes, "disputes.csv")}>
          Export CSV
        </Button>
      </div>

      {loading ? (
        <p>Loading disputes...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">User</th>
                <th className="p-2 border">Description</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Created At</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{d.id}</td>
                  <td className="p-2 border">{d.user}</td>
                  <td className="p-2 border">{d.description}</td>
                  <td className="p-2 border">{d.status}</td>
                  <td className="p-2 border">
                    {new Date(d.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {disputes.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-4 text-gray-500">
                    No disputes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
