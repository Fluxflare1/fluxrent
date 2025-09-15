"use client";

import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });

    if (res.ok) {
      alert("Request submitted. An admin will approve your account.");
    } else {
      alert("Failed to submit request.");
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-slate-50 p-6 rounded shadow"
      >
        <h1 className="text-2xl font-bold mb-4">Request Access</h1>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-yellow-400 text-blue-900 py-2 rounded font-semibold"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
}
