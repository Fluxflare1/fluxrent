"use client"
import { useState } from "react"
import axios from "axios"

export default function UtilitiesPage() {
  const [tenantId, setTenantId] = useState("")
  const [month, setMonth] = useState("")
  const [lawma, setLawma] = useState(0)
  const [cleaner, setCleaner] = useState(0)
  const [water, setWater] = useState(0)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const body = { tenant_id: tenantId, month, LAWMA: lawma, Cleaner: cleaner, Water: water }
      const res = await axios.post("/api/utilities", body)
      alert(`Recorded utilities. Total: ${res.data.total}`)
    } catch (err) {
      console.error(err)
      alert("Failed to save utilities.")
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Record Utilities</h2>
      <form onSubmit={submit} className="space-y-3 max-w-xl">
        <input placeholder="Tenant ID" value={tenantId} onChange={e=>setTenantId(e.target.value)} className="border p-2 w-full" />
        <input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="border p-2 w-full" />
        <input type="number" value={lawma} onChange={e=>setLawma(Number(e.target.value))} className="border p-2 w-full" placeholder="LAWMA" />
        <input type="number" value={cleaner} onChange={e=>setCleaner(Number(e.target.value))} className="border p-2 w-full" placeholder="Cleaner" />
        <input type="number" value={water} onChange={e=>setWater(Number(e.target.value))} className="border p-2 w-full" placeholder="Water" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Save Utilities</button>
      </form>
    </div>
  )
}
