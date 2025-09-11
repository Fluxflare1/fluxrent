"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import axios from "axios";

type Invoice = {
  id: string;
  apartment: string;
  period: string;
  amount: number;
  status: string;
};

type Payment = {
  id: string;
  invoice_id: string;
  tenant_name: string;
  amount: number;
  method: string;
  ref: string;
  status: string;
  notes?: string;
  created_at: string;
  receipt_link?: string | null;
};

export default function TenantPaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const res = await axios.get("/api/tenant/accounts");
      setInvoices(res.data.invoices || []);
      setPayments(res.data.payments || []);
    } catch (e) {
      console.error("Failed to load tenant accounts", e);
      alert("Failed to load account data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function downloadReceipt(p: Payment) {
    if (p.receipt_link) {
      window.open(p.receipt_link, "_blank");
      return;
    }
    try {
      const body = {
        payment_reference: p.ref,
        tenant_name: p.tenant_name,
        amount: p.amount,
        date: p.created_at,
        notes: p.notes,
        method: p.method,
      };
      const res = await axios.post("/api/receipts/generate", body);
      if (res.data?.ok) {
        window.open(res.data.receipt_link, "_blank");
        loadData();
      } else {
        alert("Failed: " + JSON.stringify(res.data));
      }
    } catch (err: any) {
      console.error(err);
      alert("Error: " + (err.message || String(err)));
    }
  }

  const balance =
    invoices.reduce((acc, i) => acc + i.amount, 0) -
    payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">My Bills & Payments</h1>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                ₦{balance.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">Period</th>
                    <th className="p-2">Apartment</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((i) => (
                    <tr key={i.id} className="border-b">
                      <td className="p-2">{i.period}</td>
                      <td className="p-2">{i.apartment}</td>
                      <td className="p-2 font-semibold">
                        ₦{i.amount.toLocaleString()}
                      </td>
                      <td className="p-2">{i.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">Date</th>
                    <th className="p-2">Reference</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Method</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b">
                      <td className="p-2">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-2">{p.ref}</td>
                      <td className="p-2 font-semibold">
                        ₦{p.amount.toLocaleString()}
                      </td>
                      <td className="p-2">{p.method}</td>
                      <td className="p-2">{p.status}</td>
                      <td className="p-2">
                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded"
                          onClick={() => downloadReceipt(p)}
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
