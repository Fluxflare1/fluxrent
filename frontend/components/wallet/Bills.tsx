"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ENDPOINTS } from "@/lib/api";

export default function Bills({ token }: { token: string }) {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    fetch(ENDPOINTS.wallet.bills, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setBills);
  }, [token]);

  return (
    <div className="space-y-3 border rounded-xl p-4 shadow">
      <h2 className="font-semibold">Bills</h2>
      <ul>
        {bills.map((b: any) => (
          <li key={b.id} className="flex justify-between">
            <span>{b.bill_type}</span>
            <span>₦{b.amount}</span>
          </li>
        ))}
      </ul>
      <Button>Pay Bill</Button>
    </div>
  );
}
