'use client'
import React, { useState } from 'react'
import axios from 'axios'

export default function PropertyForm({ onSaved }: { onSaved?: (p:any)=>void }) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [numUnits, setNumUnits] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { name, address, city, state, country, num_units: numUnits }
      const res = await axios.post('/api/properties', payload)
      if (res.data?.ok) {
        alert('Property created')
        onSaved && onSaved(res.data.property)
        setName(''); setAddress(''); setCity(''); setState(''); setCountry(''); setNumUnits(0)
      } else alert('Failed: ' + JSON.stringify(res.data))
    } catch (err:any) {
      console.error(err); alert('Error: ' + (err.message||String(err)))
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-3 max-w-2xl">
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Property name" className="border p-2 w-full rounded" required />
      <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Address" className="border p-2 w-full rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input value={city} onChange={e=>setCity(e.target.value)} placeholder="City" className="border p-2 w-full rounded" />
        <input value={state} onChange={e=>setState(e.target.value)} placeholder="State" className="border p-2 w-full rounded" />
        <input value={country} onChange={e=>setCountry(e.target.value)} placeholder="Country" className="border p-2 w-full rounded" />
      </div>
      <input type="number" value={numUnits} onChange={e=>setNumUnits(Number(e.target.value))} placeholder="Number of units" className="border p-2 w-full rounded" />
      <div><button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Saving...' : 'Create Property'}</button></div>
    </form>
  )
}
