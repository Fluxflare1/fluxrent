// frontend/app/auth/signin/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await signIn("credentials", { redirect: false, email, password });
    setBusy(false);
    if (res?.ok) {
      // get session to read role then redirect
      const session = await fetch("/api/auth/session").then((r) => r.json()).catch(() => null);
      const role = session?.user?.role || "tenant";
      if (role === "admin") router.push("/admin/dashboard");
      else if (role === "property_admin") router.push("/property-admin/dashboard");
      else if (role === "agent") router.push("/agent/dashboard");
      else router.push("/tenant/dashboard");
    } else {
      setError(res?.error || "Invalid credentials");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-soft">
        <h2 className="text-2xl font-bold mb-4">Sign in</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input required value={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="••••••" className="w-full border p-2 rounded" />
          </div>
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
          <button type="submit" disabled={busy} className="w-full bg-[var(--color-primary)] text-white py-2 rounded">
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
