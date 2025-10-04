"use client";
import { useEffect, useState } from "react";
import { getWalletTransactions } from "@/services/payment.service";

export default function PaymentHistoryTable() {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await getWalletTransactions();
      setTransactions(data);
    })();
  }, []);

  return (
    <table className="table-auto w-full mt-4">
      <thead>
        <tr>
          <th>Date</th>
          <th>Reference</th>
          <th>Amount</th>
          <th>Method</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t, i) => (
          <tr key={i} className="border-t">
            <td>{new Date(t.created_at).toLocaleDateString()}</td>
            <td>{t.reference}</td>
            <td>₦{t.amount}</td>
            <td>{t.method}</td>
            <td>{t.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
