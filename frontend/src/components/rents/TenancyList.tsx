"use client";

import { useEffect, useState } from "react";
import { useRentStore } from "@/store/rent.store";
import TenancyForm from "./TenancyForm";

export default function TenancyList() {
  const { tenancies, fetchTenancies, loading } = useRentStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTenancies();
  }, [fetchTenancies]);

  if (loading) return <p>Loading tenancies...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Tenancies</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          + Add
        </button>
      </div>

      {showForm && (
        <TenancyForm
          onSuccess={() => {
            fetchTenancies();
            setShowForm(false);
          }}
        />
      )}

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
