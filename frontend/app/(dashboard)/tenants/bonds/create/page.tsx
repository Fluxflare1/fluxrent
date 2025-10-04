"use client";

import { useState } from "react";
import { createTenantBond } from "@/lib/api/tenants";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateBondPage() {
  const router = useRouter();
  const [tenant, setTenant] = useState("");
  const [manager, setManager] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTenantBond({ tenant: Number(tenant), property_manager: Number(manager) });
    router.push("/tenants/bonds");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Create Tenant Bond</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <Input type="number" placeholder="Tenant User ID" value={tenant} onChange={e => setTenant(e.target.value)} />
        <Input type="number" placeholder="Property Manager User ID" value={manager} onChange={e => setManager(e.target.value)} />
        <Button type="submit">Create Bond</Button>
      </form>
    </div>
  );
}
