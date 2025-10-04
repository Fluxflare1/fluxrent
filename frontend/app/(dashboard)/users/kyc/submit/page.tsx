"use client";
import { useEffect, useState } from "react";
import { getMe, completeKyc } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function KycSubmitPage() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ full_name: "", address: "", bvn: "", id_number: "", id_type: "" });
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await getMe();
      setUser(data);
      setForm({ ...form, full_name: `${data.first_name} ${data.last_name}` });
    })();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await completeKyc(user.id, form);
    router.push("/dashboard");
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white shadow-md p-6 rounded-xl w-96">
        <h1 className="text-xl font-bold mb-4">Complete KYC</h1>
        <input placeholder="Full Name" value={form.full_name} onChange={(e)=>setForm({...form, full_name:e.target.value})} className="input" />
        <textarea placeholder="Address" value={form.address} onChange={(e)=>setForm({...form, address:e.target.value})} className="input mt-2" />
        <input placeholder="BVN" value={form.bvn} onChange={(e)=>setForm({...form, bvn:e.target.value})} className="input mt-2" />
        <input placeholder="ID Number" value={form.id_number} onChange={(e)=>setForm({...form, id_number:e.target.value})} className="input mt-2" />
        <input placeholder="ID Type" value={form.id_type} onChange={(e)=>setForm({...form, id_type:e.target.value})} className="input mt-2" />
        <button type="submit" className="btn-primary mt-4 w-full">Submit</button>
      </form>
    </div>
  );
}
