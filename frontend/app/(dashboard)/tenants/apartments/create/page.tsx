"use client";

import { useState } from "react";
import { createTenantApartment } from "@/lib/api/tenants";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateApartmentPage() {
  const router = useRouter();
  const [bond, setBond] = useState("");
  const [apartment, setApartment] = useState("");
  const [startDate, setStartDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTenantApartment({
      tenant_bond: Number(bond),
      apartment: Number(apartment),
      start_date: startDate,
    });
    router.push("/tenants/apartments");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Assign Tenant to Apartment</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <Input type="number" placeholder="Tenant Bond ID" value={bond} onChange={e => setBond(e.target.value)} />
        <Input type="number" placeholder="Apartment ID" value={apartment} onChange={e => setApartment(e.target.value)} />
        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <Button type="submit">Assign</Button>
      </form>
    </div>
  );
}
