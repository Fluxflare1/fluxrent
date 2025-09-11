'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

function BillForm({ onSaved }: { onSaved?: (b:any)=>void }) {
  const [apartmentId, setApartmentId] = useState('')
  const [billType, setBillType] = useState('rent')
  const [period, setPeriod] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [notes, setNotes] = useState('')
  const [properties, setProperties] = useState<any[]>([])
  const [apartments, setApartments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ loadProps() }, [])

  async function loadProps() {
    try {
      const [pRes, aRes] = await Promise.all([axios.get('/api/properties'), axios.get('/api/apartments')])
      setProperties(pRes.data || [])
      setApartments(aRes.data || [])
    } catch (e) { console.error(e) }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!apartmentId || !amount) return alert('Apartment & amount required')
    setLoading(true)
    try {
      const body = { apartment_id: apartmentId, bill_type: billType, period, due_date: dueDate, amount, notes, source: 'manual' }
      const res = await axios.post('/api/bills', body)
      if (res.data?.ok) {
        alert('Bill created')
        onSaved && onSaved(res.data.bill)
        setApartmentId(''); setBillType('rent'); setPeriod(''); setDueDate(''); setAmount(0); setNotes('')
      } else alert('Failed: ' + JSON.stringify(res.data))
    } catch (err:any) { console.error(err); alert('Error: ' + (err.message||String(err))) } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm">Apartment</label>
        <select className="border p-2 w-full rounded" value={apartmentId} onChange={e=>setApartmentId(e.target.value)} required>
          <option value="">Select Apartment</option>
          {apartments.map((a:any)=> <option key={a.id} value={a.id}>{a.unit_number} — {a.property_id}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select value={billType} onChange={e=>setBillType(e.target.value)} className="border p-2 rounded">
          <option value="rent">Rent</option>
          <option value="utility">Utility</option>
          <option value="misc">Miscellaneous</option>
        </select>
        <input type="month" value={period} onChange={e=>setPeriod(e.target.value)} className="border p-2 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="border p-2 rounded" />
        <input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} className="border p-2 rounded" placeholder="Amount" />
      </div>
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} className="border p-2 rounded w-full" placeholder="Notes (optional)" />
      <div><button className="bg-blue-600 text-white px-4 py-2 rounded">Create Bill</button></div>
    </form>
  )
}

function BillRow({ bill, onSelect }: { bill:any, onSelect: (b:any)=>void }) {
  return (
    <tr className="border-b">
      <td className="p-2">{bill.apartment_id}</td>
      <td className="p-2">{bill.bill_type}</td>
      <td className="p-2">{bill.period}</td>
      <td className="p-2">{bill.due_date}</td>
      <td className="p-2">{bill.amount}</td>
      <td className="p-2">{bill.balance}</td>
      <td className="p-2">{bill.status}</td>
      <td className="p-2"><button className="text-sm text-blue-600" onClick={()=>onSelect(bill)}>Open</button></td>
    </tr>
  )
}

export default function BillsAdminPage() {
  const [bills, setBills] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<any|null>(null)
  const [showPay, setShowPay] = useState(false)

  useEffect(()=>{ load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await axios.get('/api/bills')
      setBills(res.data || [])
    } catch (e) { console.error(e); alert('Failed to load bills') }
    setLoading(false)
  }

  function onSaved(b:any) {
    setBills(prev => [b, ...prev])
  }

  async function applyPayment(e:any) {
    e.preventDefault()
    const amount = Number(e.target.amount.value)
    const payerName = e.target.payer_name.value
    const payerId = e.target.payer_tenant_id.value
    const method = e.target.method.value
    if (!amount || !selected) return alert('Amount required')
    try {
      const res = await axios.post(`/api/bills/${selected.id}/pay`, { amount, payer_tenant_id: payerId, payer_name: payerName, method, verified: true })
      if (res.data?.ok) {
        alert('Payment applied')
        load()
        setSelected(null)
        setShowPay(false)
      } else alert('Failed: ' + JSON.stringify(res.data))
    } catch (err:any) { console.error(err); alert('Error: ' + (err.message||String(err))) }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Bills Management</h2>

      <div className="card mb-6">
        <h3 className="mb-3 font-semibold">Create Bill</h3>
        <BillForm onSaved={onSaved} />
      </div>

      <div className="card mb-6">
        <h3 className="mb-3 font-semibold">Bills</h3>
        {loading ? <div>Loading...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100"><tr><th className="p-2">Apartment</th><th>Type</th><th>Period</th><th>Due</th><th>Amount</th><th>Balance</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {bills.map(b => <BillRow key={b.id} bill={b} onSelect={setSelected} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="card">
          <h3 className="font-semibold mb-2">Bill Details</h3>
          <p><strong>Apartment:</strong> {selected.apartment_id}</p>
          <p><strong>Type:</strong> {selected.bill_type}</p>
          <p><strong>Period:</strong> {selected.period}</p>
          <p><strong>Due:</strong> {selected.due_date}</p>
          <p><strong>Amount:</strong> {selected.amount}</p>
          <p><strong>Balance:</strong> {selected.balance}</p>
          <p className="mb-4"><strong>Status:</strong> {selected.status}</p>

          <button className="bg-green-600 text-white px-3 py-1 rounded mr-2" onClick={()=>setShowPay(true)}>Apply Payment</button>
          <button className="px-3 py-1 border rounded" onClick={()=>setSelected(null)}>Close</button>

          {showPay && (
            <form onSubmit={applyPayment} className="mt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input name="payer_name" placeholder="Payer name" className="border p-2 rounded" required />
                <input name="payer_tenant_id" placeholder="Payer tenant ID (optional)" className="border p-2 rounded" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input name="amount" placeholder="Amount" type="number" className="border p-2 rounded" required />
                <select name="method" className="border p-2 rounded">
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="paystack">Paystack</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div><button className="bg-blue-600 text-white px-4 py-2 rounded">Apply Payment</button></div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
