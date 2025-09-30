// frontend/app/dashboard/owner/settings/page.tsx
"use client";
import { useEffect, useState } from "react";
import { fetchSettings, updateSetting } from "@/lib/apiOwner";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchSettings().then(setSettings);
  }, []);

  async function handleSave(id: number, value: string) {
    try {
      await updateSetting(id, value);
      setStatus("Saved!");
    } catch {
      setStatus("Error saving");
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl mb-4">Platform Settings</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Key</th>
            <th>Value</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {settings.map(s => (
            <tr key={s.id} className="border-b">
              <td>{s.key}</td>
              <td>
                <input
                  defaultValue={s.value}
                  onBlur={e => handleSave(s.id, e.target.value)}
                  className="border p-1 w-full"
                />
              </td>
              <td><Button size="sm" onClick={() => handleSave(s.id, s.value)}>Save</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {status && <p className="mt-2 text-sm text-gray-600">{status}</p>}
    </div>
  );
}
