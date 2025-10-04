"use client";

import { useEffect, useState } from "react";
import { fetchTenantBonds, updateTenantBond, TenantBond } from "@/lib/api/tenants";
import { Button } from "@/components/ui/button";

export default function BondsPage() {
  const [bonds, setBonds] = useState<TenantBond[]>([]);

  useEffect(() => {
    fetchTenantBonds().then(setBonds);
  }, []);

  const handleStatusChange = async (id: number, status: "approved" | "rejected") => {
    await updateTenantBond(id, { status });
    setBonds(await fetchTenantBonds());
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Tenant Bonds</h1>
      <ul className="space-y-3">
        {bonds.map(bond => (
          <li key={bond.id} className="p-3 border rounded flex justify-between">
            <div>
              <p><strong>{bond.uid}</strong> — Status: {bond.status}</p>
              <p>Tenant ID: {bond.tenant}</p>
            </div>
            <div className="space-x-2">
              {bond.status === "pending" && (
                <>
                  <Button size="sm" onClick={() => handleStatusChange(bond.id, "approved")}>Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleStatusChange(bond.id, "rejected")}>Reject</Button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
