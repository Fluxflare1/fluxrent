"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ENDPOINTS } from "@/lib/api";

export default function FixedSavings({ token }: { token: string }) {
  const [savings, setSavings] = useState([]);

  useEffect(() => {
    fetch(ENDPOINTS.wallet.savings, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setSavings);
  }, [token]);

  return (
    <div className="space-y-3 border rounded-xl p-4 shadow">
      <h2 className="font-semibold">Fixed Savings</h2>
      <ul>
        {savings.map((s: any) => (
          <li key={s.id} className="flex justify-between">
            <span>{s.plan_name}</span>
            <span>₦{s.amount} (Lock: {s.locked_until})</span>
          </li>
        ))}
      </ul>
      <Button>Create Savings Plan</Button>
    </div>
  );
}
