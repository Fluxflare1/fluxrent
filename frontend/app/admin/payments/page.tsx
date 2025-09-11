'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])

  useEffect(() => { loadPayments() }, [])

  async function loadPayments() {
    try {
      const res = await axios.get('/api/payments')
      setPayments(res.data || [])
    } catch (e) {
      console.error(e)
      alert('Failed to load payments')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Payments</h2>
      <div className="card">
        <table className="w-full">
          <thead className="text-left">
            <tr><th>Date</th><th>Tenant</th><th>Amount</th><th>Type</th><th>Status</th></tr>
          </thead>
          <tbody>
            {payments.map((p:any) => (
              <tr key={p[0] || p.id}>
                <td>{p.date || p[4]}</td>
                <td>{p.tenant_name || p[2]}</td>
                <td>{p.amount || p[6]}</td>
                <td>{p.type || p[5]}</td>
                <td>{p.status || p[8]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
