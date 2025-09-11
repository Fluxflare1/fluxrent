'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function RentScheduleForm({ onCreated }: { onCreated?: (r:any)=>void }) {
  const [properties, setProperties] = useState<any[]>([])
  const [propertyId, setPropertyId] = useState('')
  const [period, setPeriod] = useState('') // YYYY-MM
  const [dueDay, setDueDay] = useState<number>(5)
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadProps() }, [])

  async function loadProps() {
    try {
      const res = await axios.get('/api/properties')
      setProperties(res.data || [])
    } catch (e) { console.error(e) }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!propertyId || !period) return alert('Property and period required')
    setLoading(true)
    try {
      const res = await axios.post('/api/rents/generate', { property_id: propertyId, period, due_day: dueDay })
      if (res.data?.ok) {
        alert('Schedules generated: ' + (res.data.created?.length || 0))
        onCreated && onCreated(res.data.created)
      } else alert('Failed: ' + JSON.stringify(res.data))
    } catch (err:any) {
      console.error(err); alert('Error: ' + (err.message||String(err)))
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-3 max-w-2xl">
      <select className="border p-2 w-full rounded" value={propertyId} onChange={e=>setPropertyId(e.target.value)} required>
        <option value="">Select Property</option>
        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <input type="month" value={period} onChange={e=>setPeriod(e.target.value)} className="border p-2 w-full rounded" required />
      <input type="number" value={dueDay} onChange={e=>setDueDay(Number(e.target.value))} className="border p-2 w-full rounded" min={1} max={28} />
      <div><button className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Generating...' : 'Generate Rent Schedule'}</button></div>
    </form>
  )
}
