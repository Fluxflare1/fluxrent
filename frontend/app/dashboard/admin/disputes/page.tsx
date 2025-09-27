// frontend/app/dashboard/admin/disputes/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { apiFetch, ENDPOINTS } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch(ENDPOINTS.finance.disputes + "?page_size=50");
      setDisputes(data.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function resolve(uid: string, resolution: string) {
    try {
      await apiFetch(`${ENDPOINTS.finance.disputes}${uid}/resolve/`, {
        method: "POST",
        body: JSON.stringify({ resolution }),
      });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Admin — Disputes</h2>
      {loading ? <div>Loading...</div> : null}
      <div className="space-y-3">
        {disputes.map((d) => (
          <div key={d.uid} className="border rounded p-3">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">Dispute {d.uid}</div>
                <div className="text-sm text-slate-600">Txn: {d.transaction}</div>
                <div className="text-sm text-slate-600">By: {d.raised_by}</div>
              </div>
              <div className="text-right">
                <div className="text-sm">{d.status}</div>
                <div className="text-xs text-slate-500">{new Date(d.created_at).toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-2 text-sm">{d.reason}</div>
            <div className="mt-3 flex gap-2">
              <Button onClick={() => resolve(d.uid, "refund")}>Resolve: Refund</Button>
              <Button onClick={() => resolve(d.uid, "no_action")} variant="ghost">Resolve: No action</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
