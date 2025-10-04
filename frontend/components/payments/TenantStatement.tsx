"use client";
import { useState } from "react";
import { getTenantStatement } from "@/services/payment.service";

export default function TenantStatement() {
  const [tenantId, setTenantId] = useState<number>(0);
  const [records, setRecords] = useState<any[]>([]);

  const fetchStatement = async () => {
    if (tenantId > 0) {
      const { data } = await getTenantStatement(tenantId);
      setRecords(data);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-3">Tenant Statement</h2>
      <div className="flex gap-3">
        <input
          type="number"
          placeholder="Enter Tenant ID"
          value={tenantId}
          onChange={(e) => setTenantId(Number(e.target.value))}
          className="input"
        />
        <button onClick={fetchStatement} className="btn-primary">
          Fetch
        </button>
      </div>
      {records.length > 0 && (
        <table className="table-auto w-full mt-4 border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Invoice</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Method</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec, i) => (
              <tr key={i} className="border-t">
                <td className="p-2 border">{rec.invoice_uid}</td>
                <td className="p-2 border">₦{rec.amount}</td>
                <td className="p-2 border">{rec.method}</td>
                <td className="p-2 border">{rec.status}</td>
                <td className="p-2 border">
                  {new Date(rec.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
