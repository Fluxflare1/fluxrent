"use client";

import { useEffect } from "react";
import { useRentStore } from "@/store/rent.store";

export default function TenancyList() {
  const { tenancies, fetchTenancies, loading } = useRentStore();

  useEffect(() => {
    fetchTenancies();
  }, [fetchTenancies]);

  if (loading) return <p>Loading tenancies...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Tenancies</h2>
      <ul className="divide-y">
        {tenancies.map((t) => (
          <li key={t.id} className="p-2 flex justify-between">
            <div>
              <p>{t.apartment_name}</p>
              <p className="text-sm text-gray-500">{t.tenant_email}</p>
            </div>
            <span className="font-medium">{t.monthly_rent}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
