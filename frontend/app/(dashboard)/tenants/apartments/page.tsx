"use client";

import { useEffect, useState } from "react";
import { fetchTenantApartments, TenantApartment } from "@/lib/api/tenants";

export default function ApartmentsPage() {
  const [apartments, setApartments] = useState<TenantApartment[]>([]);

  useEffect(() => {
    fetchTenantApartments().then(setApartments);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Tenant Apartments</h1>
      <ul className="space-y-3">
        {apartments.map(ap => (
          <li key={ap.id} className="p-3 border rounded">
            <p><strong>{ap.uid}</strong> — Apartment ID: {ap.apartment}</p>
            <p>Bond: {ap.tenant_bond} | Active: {ap.is_active ? "Yes" : "No"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
