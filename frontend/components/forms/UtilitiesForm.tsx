// frontend/components/forms/UtilitiesForm.tsx
'use client'
import React, { useState } from 'react'
import axios from 'axios'

type Props = { onSaved?: (u:any)=>void }

export default function UtilitiesForm({ onSaved }: Props) {
  const [tenantId, setTenantId] = useState('')
  const [month, setMonth] = useState('')
  const [LAWMA, setLAWMA] = useState<number>(0)
  const [Cleaner, setCleaner] = useState<number>(0)
  const [Water, setWater] = useState<number>(0)
  const [Community, setCommunity] = useState<number>(0)
  const [Misc, setMisc] = useState<number>(0)
  const [BankCharges, setBankCharges] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!tenantId || !month) return alert('Tenant ID and month required')
    setLoading(true)
    try {
      const payload = { tenant_id: tenantId, month, LAWMA, Cleaner, Water, Community, Misc, BankCharges }
      const res = await axios.post('/api/utilities', payload)
      if (res.data?.ok) {
        alert('Utility recorded')
        onSaved && onSaved(res.data.utility)
        setTenantId(''); setMonth(''); setLAWMA(0); setCleaner(0); setWater(0); setCommunity(0); setMisc(0); setBankCharges(0)
      } else {
        alert('Failed: ' + JSON.stringify(res.data))
      }
    } catch (err:any) {
      console.error(err); alert('Error saving utility: ' + (err.message||String(err)))
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-3 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium">Tenant ID</label>
          <input value={tenantId} onChange={e=>setTenantId(e.target.value)} className="border p-2 w-full rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Month</label>
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="border p-2 w-full rounded" required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div><label className="text-sm">LAWMA</label><input type="number" value={LAWMA} onChange={e=>setLAWMA(Number(e.target.value))} className="border p-2 w-full rounded" /></div>
        <div><label className="text-sm">Cleaner</label><input type="number" value={Cleaner} onChange={e=>setCleaner(Number(e.target.value))} className="border p-2 w-full rounded" /></div>
        <div><label className="text-sm">Water</label><input type="number" value={Water} onChange={e=>setWater(Number(e.target.value))} className="border p-2 w-full rounded" /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div><label className="text-sm">Community</label><input type="number" value={Community} onChange={e=>setCommunity(Number(e.target.value))} className="border p-2 w-full rounded" /></div>
        <div><label className="text-sm">Misc</label><input type="number" value={Misc} onChange={e=>setMisc(Number(e.target.value))} className="border p-2 w-full rounded" /></div>
        <div><label className="text-sm">Bank Charges</label><input type="number" value={BankCharges} onChange={e=>setBankCharges(Number(e.target.value))} className="border p-2 w-full rounded" /></div>
      </div>

      <div>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? 'Saving...' : 'Save Utility'}
        </button>
      </div>
    </form>
  )
}
