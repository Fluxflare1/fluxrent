"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch, ENDPOINTS } from "@/lib/api";

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<any>(null);

  async function load() {
    const res = await apiFetch(ENDPOINTS.admin.settings);
    setSettings(res);
  }

  async function save() {
    await apiFetch(ENDPOINTS.admin.settings, { method: "POST", body: JSON.stringify(settings) });
    load();
  }

  useEffect(() => {
    load();
  }, []);

  if (!settings) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Platform Settings</h2>
      <div className="space-y-2">
        <label>
          Free Post Days
          <input
            type="number"
            value={settings.free_post_days}
            onChange={(e) => setSettings({ ...settings, free_post_days: Number(e.target.value) })}
            className="border p-2 rounded w-full"
          />
        </label>
        <label>
          Min Boost Days
          <input
            type="number"
            value={settings.min_boost_days}
            onChange={(e) => setSettings({ ...settings, min_boost_days: Number(e.target.value) })}
            className="border p-2 rounded w-full"
          />
        </label>
        <label>
          Boost Daily Rate (₦)
          <input
            type="number"
            value={settings.boost_daily_rate}
            onChange={(e) => setSettings({ ...settings, boost_daily_rate: Number(e.target.value) })}
            className="border p-2 rounded w-full"
          />
        </label>
      </div>
      <Button onClick={save} className="mt-4">Save</Button>
    </div>
  );
}
