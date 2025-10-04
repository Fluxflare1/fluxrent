"use client";
import { useEffect, useState } from "react";
import { getPaymentReports } from "@/services/payment.service";

export default function ReportsTable() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await getPaymentReports();
      setReports(data);
    })();
  }, []);

  if (!reports.length) return <p>No reports available.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Tenant</th>
            <th className="p-2 border">Invoice</th>
            <th className="p-2 border">Amount</th>
            <th className="p-2 border">Method</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Date</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r, i) => (
            <tr key={i} className="border-t">
              <td className="p-2 border">{r.tenant_name || "N/A"}</td>
              <td className="p-2 border">{r.invoice_uid}</td>
              <td className="p-2 border">₦{r.amount}</td>
              <td className="p-2 border">{r.method}</td>
              <td className="p-2 border">{r.status}</td>
              <td className="p-2 border">
                {new Date(r.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
