"use client"
import axios from "axios"
import React, { useEffect, useState } from 'react'
import UtilitiesForm from '../../../components/forms/UtilitiesForm'
import UtilitiesTable from '../../../components/tables/UtilitiesTable'


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





export default function UtilitiesAdminPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await axios.get('/api/utilities')
      setItems(res.data || [])
    } catch (err) {
      console.error(err)
      alert('Failed to load utilities')
    } finally {
      setLoading(false)
    }
  }

  function onSaved(u:any) {
    setItems(prev => [u, ...prev])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Utilities Management</h2>
      </div>

      <div className="card mb-6">
        <UtilitiesForm onSaved={onSaved} />
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">Recorded Utilities</h3>
        {loading ? <div className="text-sm text-gray-500">Loading...</div> : <UtilitiesTable items={items} />}
      </div>
    </div>
  )
}
