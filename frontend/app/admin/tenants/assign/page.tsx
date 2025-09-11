"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface Tenant {
  id: string;
  name: string;
}
interface Apartment {
  id: string;
  name: string;
}

export default function AssignTenantPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [tenantId, setTenantId] = useState("");
  const [apartmentId, setApartmentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tRes = await axios.get("/api/tenants");
        const aRes = await axios.get("/api/apartments");
        setTenants(tRes.data);
        setApartments(aRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !apartmentId) return;
    setLoading(true);
    setMessage("");

    try {
      await axios.post("/api/tenants/assign", {
        tenant_id: tenantId,
        apartment_id: apartmentId,
      });
      setMessage("Tenant successfully assigned!");
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Error assigning tenant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Assign Tenant to Apartment</h1>
      <form onSubmit={handleAssign} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select Tenant</label>
          <select
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">-- Select Tenant --</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Select Apartment</label>
          <select
            value={apartmentId}
            onChange={(e) => setApartmentId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">-- Select Apartment --</option>
            {apartments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Assigning..." : "Assign Tenant"}
        </button>
      </form>
      {message && (
        <p className="mt-4 text-center text-sm text-green-600">{message}</p>
      )}
    </div>
  );
}
