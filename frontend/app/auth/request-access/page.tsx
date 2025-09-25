// app/auth/request-access/page.tsx
"use client";
import { useState } from "react";
import { requestAccess } from "../../../lib/api";

export default function RequestAccess() {
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState({ first_name: "", last_name: "", email: "", phone: "" });
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await requestAccess(data);
      setMessage("Request submitted. Check your email for next steps.");
      setData({ first_name: "", last_name: "", email: "", phone: "" });
    } catch (err: any) {
      setMessage(err?.message || "Failed to submit request");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Request Access</h2>
      {message && <div className="p-2 bg-green-50 rounded mb-3">{message}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="First name" value={data.first_name} onChange={(e)=>setData({...data, first_name:e.target.value})} className="border px-3 py-2 rounded"/>
          <input required placeholder="Last name" value={data.last_name} onChange={(e)=>setData({...data, last_name:e.target.value})} className="border px-3 py-2 rounded"/>
        </div>
        <div>
          <input required type="email" placeholder="Email" value={data.email} onChange={(e)=>setData({...data, email:e.target.value})} className="w-full border px-3 py-2 rounded"/>
        </div>
        <div>
          <input required placeholder="Phone" value={data.phone} onChange={(e)=>setData({...data, phone:e.target.value})} className="w-full border px-3 py-2 rounded"/>
        </div>
        <button type="submit" disabled={busy} className="w-full bg-primary-500 text-white py-2 rounded">
          {busy ? "Submitting…" : "Request Access"}
        </button>
      </form>
    </div>
  );
}
