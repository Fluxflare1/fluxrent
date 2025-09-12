"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import axios from "axios";

type Payment = {
  id: string;
  tenant_id: string;
  tenant_name: string;
  apartment: string;
  invoice_id: string;
  amount: number;
  method: string;
  ref: string;
  status: string;
  created_at: string;
  receipt_link?: string | null;
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    tenant_id: "",
    tenant_name: "",
    apartment: "",
    invoice_id: "",
    amount: "",
    method: "CASH",
    ref: "",
  });

  async function fetchPayments() {
    setLoading(true);
    try {
      const res = await axios.get("/api/accounts/payments");
      setPayments(res.data || []);
    } catch (err) {
      console.error("Error fetching payments", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await axios.post("/api/accounts/payments", form);
      await fetchPayments();
      setForm({
        tenant_id: "",
        tenant_name: "",
        apartment: "",
        invoice_id: "",
        amount: "",
        method: "CASH",
        ref: "",
      });
    } catch (err) {
      console.error("Error recording payment", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(id: string) {
    try {
      await axios.post("/api/accounts/payments/verify", { payment_id: id });
      await fetchPayments();
    } catch (err) {
      console.error("Error verifying payment", err);
    }
  }

  async function handleGenerateReceipt(p: Payment) {
    try {
      const body = {
        payment_reference: p.ref,
        tenant_name: p.tenant_name,
        amount: p.amount,
        date: p.created_at,
        method: p.method,
      };
      const res = await axios.post("/api/receipts/generate", body);
      if (res.data.ok) {
        alert("Receipt created");
        await fetchPayments();
        window.open(res.data.receipt_link, "_blank");
      } else {
        alert("Failed: " + JSON.stringify(res.data));
      }
    } catch (err: any) {
      console.error(err);
      alert("Error: " + (err.message || String(err)));
    }
  }

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Payments Management</h1>

      {/* Manual Payment Form */}
      <Card className="shadow-md border rounded-2xl">
        <CardHeader>
          <CardTitle>Record Manual Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tenant ID</Label>
              <Input
                name="tenant_id"
                value={form.tenant_id}
                onChange={(e) => setForm({ ...form, tenant_id: e.target.value })}
                placeholder="Tenant ID"
              />
            </div>
            <div>
              <Label>Tenant Name</Label>
              <Input
                name="tenant_name"
                value={form.tenant_name}
                onChange={(e) => setForm({ ...form, tenant_name: e.target.value })}
                placeholder="Tenant Name"
              />
            </div>
            <div>
              <Label>Apartment</Label>
              <Input
                name="apartment"
                value={form.apartment}
                onChange={(e) => setForm({ ...form, apartment: e.target.value })}
                placeholder="Apartment"
              />
            </div>
            <div>
              <Label>Invoice ID</Label>
              <Input
                name="invoice_id"
                value={form.invoice_id}
                onChange={(e) => setForm({ ...form, invoice_id: e.target.value })}
                placeholder="Invoice ID"
              />
            </div>
            <div>
              <Label>Amount (₦)</Label>
              <Input
                name="amount"
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Method</Label>
              <select
                name="method"
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
                className="w-full border rounded-md p-2"
              >
                <option value="CASH">Cash</option>
                <option value="TRANSFER">Bank Transfer</option>
                <option value="POS">POS</option>
              </select>
            </div>
            <div>
              <Label>Reference (optional)</Label>
              <Input
                name="ref"
                value={form.ref}
                onChange={(e) => setForm({ ...form, ref: e.target.value })}
                placeholder="Reference Number"
              />
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={submitting} className="mt-4">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Record Payment
          </Button>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card className="shadow-md border rounded-2xl">
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : payments.length === 0 ? (
            <p className="text-gray-500">No payments recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">Tenant</th>
                    <th className="p-2">Apartment</th>
                    <th className="p-2">Invoice</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Method</th>
                    <th className="p-2">Reference</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Receipt</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b">
                      <td className="p-2">{p.tenant_name}</td>
                      <td className="p-2">{p.apartment}</td>
                      <td className="p-2">{p.invoice_id}</td>
                      <td className="p-2 font-semibold">₦{p.amount.toLocaleString()}</td>
                      <td className="p-2">{p.method}</td>
                      <td className="p-2">{p.ref}</td>
                      <td className="p-2">
                        {p.status === "VERIFIED" ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center text-yellow-600">
                            <XCircle className="h-4 w-4 mr-1" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="p-2">
                        {p.receipt_link ? (
                          <a
                            className="text-blue-600"
                            href={p.receipt_link}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open
                          </a>
                        ) : (
                          <Button onClick={() => handleGenerateReceipt(p)}className="px-3 py-1 text-sm">
                            Generate
                          </Button>
                        )}
                      </td>
                      <td className="p-2">
                        {p.status !== "VERIFIED" && (
                          <Button size="sm" onClick={() => handleVerify(p.id)}>
                            Verify
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
