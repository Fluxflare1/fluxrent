'use client'
import React, { useState } from 'react'
import axios from 'axios'

export default function TenantForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [tenantType, setTenantType] = useState('Individual')
  const [property, setProperty] = useState('')
  const [unit, setUnit] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const payload = {
        id: `t_${Date.now()}`,
        name, email, phone, tenant_type: tenantType, property, unit, created_at: new Date().toISOString()
      }
      await axios.post('/api/tenants', payload)
      alert('Tenant saved')
      setName(''); setEmail(''); setPhone(''); setProperty(''); setUnit('')
    } catch (e) {
      console.error(e); alert('Failed to save tenant')
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 max-w-2xl">
      <div><label className="block text-sm font-medium">Full name</label>
      <input required value={name} onChange={e=>setName(e.target.value)} className="border p-2 w-full rounded" /></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div><label className="block text-sm">Email</label><input value={email} onChange={e=>setEmail(e.target.value)} className="border p-2 w-full rounded" /></div>
        <div><label className="block text-sm">Phone</label><input value={phone} onChange={e=>setPhone(e.target.value)} className="border p-2 w-full rounded" /></div>
        <div><label className="block text-sm">Tenant Type</label>
          <select value={tenantType} onChange={e=>setTenantType(e.target.value)} className="border p-2 w-full rounded">
            <option>Individual</option><option>Company</option>
          </select></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><label className="block text-sm">Property</label><input value={property} onChange={e=>setProperty(e.target.value)} className="border p-2 w-full rounded" /></div>
        <div><label className="block text-sm">Unit</label><input value={unit} onChange={e=>setUnit(e.target.value)} className="border p-2 w-full rounded" /></div>
      </div>

      <div><button className="bg-blue-600 text-white px-4 py-2 rounded">Save Tenant</button></div>
    </form>
  )
}
