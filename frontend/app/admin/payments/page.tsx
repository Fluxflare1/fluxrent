'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await axios.get('/api/payments')
      setPayments((res.data || []).map((r:any[]) => ({
        id: r[0], reference: r[1], tenant_id: r[2], tenant_name: r[3], date: r[4], type: r[5], amount: r[6], method: r[7], status: r[8], notes: r[9], created_at: r[10], receipt_link: r[11] || null
      })))
    } catch (e) {
      console.error(e); alert('Failed to load payments')
    } finally { setLoading(false) }
  }

  async function generateReceipt(p:any) {
    try {
      const body = { payment_reference: p.reference, tenant_name: p.tenant_name, amount: p.amount, date: p.date, notes: p.notes, method: p.method }
      const res = await axios.post('/api/receipts/generate', body)
      if (res.data.ok) {
        alert('Receipt created')
        load()
        window.open(res.data.receipt_link, '_blank')
      } else alert('Failed: ' + JSON.stringify(res.data))
    } catch (err:any) { console.error(err); alert('Error: ' + (err.message||String(err))) }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Payments</h2>
      <div className="card">
        {loading ? <div>Loading...</div> : (
          <table className="w-full">
            <thead className="bg-gray-100"><tr><th>Date</th><th>Reference</th><th>Tenant</th><th>Amount</th><th>Status</th><th>Receipt</th></tr></thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.reference} className="border-b">
                  <td className="p-2">{p.date}</td>
                  <td className="p-2">{p.reference}</td>
                  <td className="p-2">{p.tenant_name}</td>
                  <td className="p-2">{p.amount}</td>
                  <td className="p-2">{p.status}</td>
                  <td className="p-2">
                    {p.receipt_link ? <a className="text-blue-600" href={p.receipt_link} target="_blank" rel="noreferrer">Open</a> : <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={()=>generateReceipt(p)}>Generate Receipt</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
