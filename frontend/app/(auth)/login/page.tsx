"use client";
import { useState } from "react";
import { login } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const { data } = await login(email, password);
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      router.push("/dashboard");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white shadow-md p-6 rounded-xl w-96">
        <h1 className="text-xl font-bold mb-4">Login</h1>
        <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} className="input" />
        <input placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="input mt-2" />
        <button type="submit" className="btn-primary mt-4 w-full">Login</button>
      </form>
    </div>
  );
}
