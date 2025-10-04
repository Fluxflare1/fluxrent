"use client";
import { useState } from "react";
import { requestAccess } from "@/services/auth.service";

export default function RequestAccessPage() {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone_number: "" });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await requestAccess(form);
      setMessage("Access requested. Please check your email.");
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Error occurred.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Request Access</h2>
        <input placeholder="First Name" value={form.first_name} onChange={(e)=>setForm({...form, first_name:e.target.value})} className="input" />
        <input placeholder="Last Name" value={form.last_name} onChange={(e)=>setForm({...form, last_name:e.target.value})} className="input mt-2" />
        <input placeholder="Email" type="email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} className="input mt-2" />
        <input placeholder="Phone Number" value={form.phone_number} onChange={(e)=>setForm({...form, phone_number:e.target.value})} className="input mt-2" />
        <button type="submit" className="btn-primary mt-4 w-full">Create Access</button>
        {message && <p className="mt-2 text-sm text-green-600">{message}</p>}
      </form>
    </div>
  );
}
