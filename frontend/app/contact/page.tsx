// frontend/app/contact/page.tsx
"use client";
import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // lightweight: open mailto link (no server required). For production you'd wire an API.
    const subject = encodeURIComponent("FluxRent Inquiry from " + name);
    const body = encodeURIComponent(message + "\n\nContact: " + email);
    window.location.href = `mailto:hello@fluxrent.example?subject=${subject}&body=${body}`;
    setOk("Opening email client...");
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold mb-4">Contact Sales / Support</h1>
        <p className="text-slate-600 mb-6">Describe your needs and we’ll reach out.</p>

        <form onSubmit={submit} className="space-y-4">
          <input required value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your name" className="w-full border rounded px-3 py-2" />
          <input required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" type="email" className="w-full border rounded px-3 py-2" />
          <textarea required value={message} onChange={(e)=>setMessage(e.target.value)} rows={6} placeholder="Message" className="w-full border rounded px-3 py-2" />
          <div>
            <button type="submit" className="px-6 py-2 bg-blue-900 text-white rounded">Send</button>
            {ok ? <span className="ml-3 text-slate-500">{ok}</span> : null}
          </div>
        </form>
      </div>
    </div>
  );
}
