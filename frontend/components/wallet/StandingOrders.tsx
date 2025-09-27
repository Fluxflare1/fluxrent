"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ENDPOINTS } from "@/lib/api";

export default function StandingOrders({ token }: { token: string }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(ENDPOINTS.wallet.standingOrders, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setOrders);
  }, [token]);

  return (
    <div className="space-y-3 border rounded-xl p-4 shadow">
      <h2 className="font-semibold">Standing Orders</h2>
      <ul>
        {orders.map((o: any) => (
          <li key={o.id} className="flex justify-between">
            <span>{o.recipient} — ₦{o.amount}</span>
            <span>{o.frequency}</span>
          </li>
        ))}
      </ul>
      <Button>Add New Standing Order</Button>
    </div>
  );
}
