"use client";
import { useEffect, useState } from "react";
import { apiFetch, ENDPOINTS } from "@/lib/api";

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    apiFetch(ENDPOINTS.wallet.audit).then(setLogs).catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Audit Logs</h1>
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="border rounded-lg p-3 shadow-sm">
            <div className="font-mono text-sm">Ref: {log.reference}</div>
            <div className="text-sm">Action: {log.action}</div>
            <div className="text-xs text-gray-500">
              {new Date(log.created_at).toLocaleString()}
            </div>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-2">{JSON.stringify(log.details, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
