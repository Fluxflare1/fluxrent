// frontend/components/wallet/FixedSavings.tsx
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WalletActionWrapper from "./WalletActionWrapper";
import { apiFetch, ENDPOINTS } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function FixedSavings() {
  const [savings, setSavings] = useState<any[]>([]);
  const [planName, setPlanName] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [lockMonths, setLockMonths] = useState<number>(3);
  const { toast } = useToast();

  async function load() {
    const res = await apiFetch(ENDPOINTS.wallet.savings);
    setSavings(res);
  }

  useEffect(() => {
    load();
  }, []);

  async function createPlan() {
    if (!planName || !amount || amount <= 0) {
      toast({ title: "Invalid input", description: "Enter plan name and positive amount" });
      return;
    }
    const payload = { plan_name: planName, amount, lock_months: lockMonths };
    const res = await apiFetch(ENDPOINTS.wallet.savings, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    toast({ title: "Savings created" });
    load();
    return res;
  }

  return (
    <div className="border rounded-xl p-4 shadow space-y-3">
      <h3 className="font-semibold">Fixed Savings</h3>

      <ul>
        {savings.map((s) => (
          <li key={s.id} className="flex justify-between">
            <div>{s.plan_name}</div>
            <div>₦{s.amount} — lock until {s.locked_until}</div>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Input placeholder="Plan name" value={planName} onChange={(e) => setPlanName(e.target.value)} />
        <Input placeholder="Amount" type="number" onChange={(e) => setAmount(Number(e.target.value))} />
        <Input placeholder="Lock months" type="number" value={lockMonths} onChange={(e) => setLockMonths(Number(e.target.value))} />
      </div>

      <WalletActionWrapper
        actionName="Create savings plan"
        methodOptions={["pin"]}
        onValidated={async () => {
          try {
            await createPlan();
            toast({ title: "Savings created" });
          } catch (err: any) {
            toast({ title: "Error", description: err?.payload?.detail || err.message });
          }
        }}
      >
        {(open) => <Button onClick={open}>Create Savings</Button>}
      </WalletActionWrapper>
    </div>
  );
}
