'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function ApartmentForm({ onSaved }: { onSaved?: (a:any)=>void }) {
  const [properties, setProperties] = useState<any[]>([])
  const [propertyId, setPropertyId] = useState('')
  const [unitNumber, setUnitNumber] = useState('')
  const [type, setType] = useState('')
  const [size, setSize] = useState('')
  const [rentAmount, setRentAmount] = useState<number>(0)
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
    setLoading(true)
    try {
      const payload = { property_id: propertyId, unit_number: unitNumber, type, size, rent_amount: rentAmount }
      const res = await axios.post('/api/apartments', payload)
      if (res.data?.ok) {
        alert('Apartment created')
        onSaved && onSaved(res.data.apartment)
        setPropertyId(''); setUnitNumber(''); setType(''); setSize(''); setRentAmount(0)
      } else alert('Failed')
    } catch (err:any) {
      console.error(err); alert('Error: ' + (err.message||String(err)))
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-3 max-w-2xl">
      <select value={propertyId} onChange={e=>setPropertyId(e.target.value)} className="border p-2 w-full rounded" required>
        <option value="">Select Property</option>
        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <input value={unitNumber} onChange={e=>setUnitNumber(e.target.value)} placeholder="Unit number (e.g., A1)" className="border p-2 w-full rounded" required />
      <div className="grid grid-cols-2 gap-3">
        <input value={type} onChange={e=>setType(e.target.value)} placeholder="Type (1BR/2BR)" className="border p-2 w-full rounded" />
        <input value={size} onChange={e=>setSize(e.target.value)} placeholder="Size (sqm)" className="border p-2 w-full rounded" />
      </div>
      <input type="number" value={rentAmount} onChange={e=>setRentAmount(Number(e.target.value))} placeholder="Monthly rent amount" className="border p-2 w-full rounded" required />
      <div><button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Saving...' : 'Create Apartment'}</button></div>
    </form>
  )
}
