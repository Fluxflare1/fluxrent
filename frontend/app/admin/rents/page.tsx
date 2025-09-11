'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import RentScheduleForm from '../../../components/forms/RentScheduleForm'
import RentScheduleTable from '../../../components/tables/RentScheduleTable'

export default function RentsAdminPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await axios.get('/api/rents')
      setItems(res.data || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function markPaid(item:any) {
    const reference = prompt('Enter payment reference (e.g., paystack ref or manual ref):')
    if (!reference) return
    try {
      const res = await axios.post('/api/rents', { scheduleId: item.id, paymentReference: reference })
      if (res.data?.ok) {
        alert('Marked paid')
        load()
      } else alert('Failed: ' + JSON.stringify(res.data))
    } catch (err:any) {
      console.error(err); alert('Error: ' + (err.message||String(err)))
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Rent Schedules</h2>
      <div className="card mb-6">
        <RentScheduleForm onCreated={c=>{ setItems(prev=>[...c, ...prev]) }} />
      </div>
      <div className="card">
        {loading ? <div>Loading...</div> : <RentScheduleTable items={items} onMarkPaid={markPaid} />}
      </div>
    </div>
  )
}
