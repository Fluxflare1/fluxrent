// frontend/app/(auth)/forgot-password/page.tsx
"use client";

import React, { useState } from "react";
import { api, ENDPOINTS } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post(ENDPOINTS.passwordReset, { email });
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Could not request password reset");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Forgot password</h2>

        {sent ? (
          <div className="text-sm text-green-600">If the email exists we'll send password reset instructions shortly.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div>
              <label className="block text-sm">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 p-2" />
            </div>
            <button className="py-2 px-4 bg-indigo-600 text-white rounded-md">Request reset</button>
          </form>
        )}
      </div>
    </div>
  );
}
