"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import UtilitiesForm from "../../../components/forms/UtilitiesForm";
import UtilitiesTable from "../../../components/tables/UtilitiesTable";

export default function UtilitiesAdminPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await axios.get("/api/utilities");
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load utilities");
    } finally {
      setLoading(false);
    }
  }

  function onSaved(u: any) {
    setItems((prev) => [u, ...prev]);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Utilities Management</h2>
      </div>

      <div className="card mb-6">
        <UtilitiesForm onSaved={onSaved} />
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">Recorded Utilities</h3>
        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          <UtilitiesTable items={items} />
        )}
      </div>
    </div>
  );
}
