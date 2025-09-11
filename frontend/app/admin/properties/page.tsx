'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import PropertyForm from '../../../components/forms/PropertyForm'
import PropertyTable from '../../../components/tables/PropertyTable'

export default function PropertiesAdminPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await axios.get('/api/properties')
      setItems(res.data || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Properties</h2>
      <div className="card mb-6">
        <PropertyForm onSaved={p=>setItems(prev=>[p,...prev])} />
      </div>
      <div className="card">
        {loading ? <div>Loading...</div> : <PropertyTable items={items} />}
      </div>
    </div>
  )
}
