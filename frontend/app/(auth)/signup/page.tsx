// frontend/app/(auth)/signup/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { api, ENDPOINTS } from "@/lib/api";

type AccountStep = {
  email: string;
  password: string;
  password_confirm: string;
};
type PersonalStep = {
  first_name: string;
  last_name: string;
  phone: string;
};
type KycStep = {
  bvn?: string;
  id_type?: string;
  id_number?: string;
  address?: string;
};

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [account, setAccount] = useState<AccountStep>({ email: "", password: "", password_confirm: "" });
  const [personal, setPersonal] = useState<PersonalStep>({ first_name: "", last_name: "", phone: "" });
  const [kyc, setKyc] = useState<KycStep>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAccountNext(e: React.FormEvent) {
    e.preventDefault();
    if (account.password !== account.password_confirm) {
      setError("Passwords do not match");
      return;
    }
    setError(null);
    setStep(2);
  }

  async function handlePersonalNext(e: React.FormEvent) {
    e.preventDefault();
    setStep(3);
  }

  async function handleKycSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Register core account
      const regPayload = {
        email: account.email,
        password: account.password,
        first_name: personal.first_name,
        last_name: personal.last_name,
        phone: personal.phone,
      };
      const data = await register(regPayload);

      // If backend expects KYC as separate call
      await api.post(ENDPOINTS.kyc, {
        user: data.id || data.pk || data.uid,
        ...kyc,
      });

      router.push("/auth/login");
    } catch (err: any) {
      setError(err?.response?.data?.detail || JSON.stringify(err?.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Request Access — Create Account</h2>
        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
        {step === 1 && (
          <form onSubmit={handleAccountNext} className="space-y-4">
            <div>
              <label className="block text-sm">Email</label>
              <input type="email" required value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 p-2" />
            </div>
            <div>
              <label className="block text-sm">Password</label>
              <input type="password" required value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 p-2" />
            </div>
            <div>
              <label className="block text-sm">Confirm Password</label>
              <input type="password" required value={account.password_confirm} onChange={(e) => setAccount({ ...account, password_confirm: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 p-2" />
            </div>
            <div className="flex justify-between">
              <div />
              <button type="submit" className="py-2 px-4 bg-indigo-600 text-white rounded-md">Next</button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handlePersonalNext} className="space-y-4">
            <div>
              <label className="block text-sm">First name</label>
              <input type="text" required value={personal.first_name} onChange={(e) => setPersonal({ ...personal, first_name: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 p-2" />
            </div>
            <div>
              <label className="block text-sm">Last name</label>
              <input type="text" required value={personal.last_name} onChange={(e) => setPersonal({ ...personal, last_name: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 p-2" />
            </div>
            <div>
              <label className="block text-sm">Phone</label>
              <input type="text" required value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 p-2" />
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="py-2 px-4 border rounded-md">Back</button>
              <button type="submit" className="py-2 px-4 bg-indigo-600 text-white rounded-md">Next</button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleKycSubmit} className="space-y-4">
            <div>
              <label className="block text-sm">ID Type (optional)</label>
              <input type="text" value={kyc.id_type || ""} onChange={(e) => setKyc({ ...kyc, id_type: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 p-2" />
            </div>
            <div>
              <label className="block text-sm">ID Number (optional)</label>
              <input type="text" value={kyc.id_number || ""} onChange={(e) => setKyc({ ...kyc, id_number: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 p-2" />
            </div>
            <div>
              <label className="block text-sm">BVN (optional)</label>
              <input type="text" value={kyc.bvn || ""} onChange={(e) => setKyc({ ...kyc, bvn: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 p-2" />
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(2)} className="py-2 px-4 border rounded-md">Back</button>
              <button type="submit" disabled={loading} className="py-2 px-4 bg-indigo-600 text-white rounded-md">{loading ? "Submitting..." : "Submit request"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
