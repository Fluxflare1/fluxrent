// frontend/components/wallet/StandingOrders.tsx
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WalletActionWrapper from "./WalletActionWrapper";
import { apiFetch, ENDPOINTS } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function StandingOrders({ }: {}) {
  const [orders, setOrders] = useState<any[]>([]);
  const [tenantApartment, setTenantApartment] = useState("");
  const [payAll, setPayAll] = useState(true);
  const [billTypes, setBillTypes] = useState<string>("");

  const { toast } = useToast();
  async function load() {
    try {
      const res = await apiFetch(ENDPOINTS.wallet.standingOrders);
      setOrders(res);
    } catch (err) {
      console.error(err);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function createOrder() {
    const payload = { tenant_apartment: tenantApartment, pay_all_bills: payAll, bill_types: billTypes ? billTypes.split(",").map(s => s.trim()) : [] };
    const res = await apiFetch(ENDPOINTS.wallet.standingOrders, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    toast({ title: "Standing order created" });
    load();
    return res;
  }

  async function toggleOrder(id: number, active: boolean) {
    await apiFetch(`${ENDPOINTS.wallet.standingOrders}${id}/`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: !active }),
    });
    load();
  }

  return (
    <div className="border rounded-xl p-4 shadow space-y-3">
      <h3 className="font-semibold">Standing Orders</h3>

      <ul className="space-y-2">
        {orders.map((o) => (
          <li key={o.id} className="flex justify-between items-center">
            <div>
              <div className="font-medium">{o.tenant_apartment} — {o.pay_all_bills ? "All" : (o.bill_types || []).join(", ")}</div>
              <div className="text-sm text-slate-600">Active: {String(o.is_active)}</div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => toggleOrder(o.id, o.is_active)}>{o.is_active ? "Disable" : "Enable"}</Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Input placeholder="TenantApartment ID" value={tenantApartment} onChange={(e) => setTenantApartment(e.target.value)} />
        <select value={String(payAll)} onChange={(e) => setPayAll(e.target.value === "true")} className="border p-2 rounded">
          <option value="true">Pay all bills</option>
          <option value="false">Select bill types</option>
        </select>
        <Input placeholder="bill types comma separated" value={billTypes} onChange={(e) => setBillTypes(e.target.value)} />
      </div>

      <WalletActionWrapper
        actionName="Create standing order"
        methodOptions={["pin"]}
        onValidated={async () => {
          try {
            await createOrder();
            toast({ title: "Standing order created" });
          } catch (err: any) {
            toast({ title: "Error", description: err?.payload?.detail || err.message });
          }
        }}
      >
        {(open) => <Button onClick={open}>Create Standing Order</Button>}
      </WalletActionWrapper>
    </div>
  );
}
