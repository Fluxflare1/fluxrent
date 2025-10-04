"use client";

import { useState } from "react";
import { RentService } from "@/services/rent.service";
import { Tenancy } from "@/types/rent.types";

interface Props {
  onSuccess: () => void;
  initial?: Partial<Tenancy>;
}

export default function TenancyForm({ onSuccess, initial = {} }: Props) {
  const [form, setForm] = useState<Partial<Tenancy>>(initial);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof Tenancy, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (form.id) {
        await RentService.createTenancy(form); // Backend doesn't have update → fallback to create
      } else {
        await RentService.createTenancy(form);
      }
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg shadow">
      <h3 className="font-semibold">{form.id ? "Update Tenancy" : "Create Tenancy"}</h3>
      <input
        type="email"
        placeholder="Tenant Email"
        value={form.tenant_email || ""}
        onChange={(e) => handleChange("tenant_email", e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Apartment Name"
        value={form.apartment_name || ""}
        onChange={(e) => handleChange("apartment_name", e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="date"
        placeholder="Start Date"
        value={form.start_date || ""}
        onChange={(e) => handleChange("start_date", e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="number"
        placeholder="Monthly Rent"
        value={form.monthly_rent || ""}
        onChange={(e) => handleChange("monthly_rent", e.target.value)}
        className="w-full border p-2 rounded"
      />
      <select
        value={form.billing_cycle || "monthly"}
        onChange={(e) => handleChange("billing_cycle", e.target.value)}
        className="w-full border p-2 rounded"
      >
        <option value="monthly">Monthly</option>
        <option value="weekly">Weekly</option>
        <option value="daily">Daily</option>
      </select>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
