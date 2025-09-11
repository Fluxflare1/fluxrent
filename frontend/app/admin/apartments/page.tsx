'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import ApartmentForm from '../../../components/forms/ApartmentForm'
import ApartmentTable from '../../../components/tables/ApartmentTable'

export default function ApartmentsAdminPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await axios.get('/api/apartments')
      setItems(res.data || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Apartments</h2>
      <div className="card mb-6">
        <ApartmentForm onSaved={a=>setItems(prev=>[a,...prev])} />
      </div>
      <div className="card">
        {loading ? <div>Loading...</div> : <ApartmentTable items={items} />}
      </div>
    </div>
  )
}
