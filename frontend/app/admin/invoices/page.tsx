'use client'
import React, { useState } from 'react'
import axios from 'axios'

export default function InvoicesPage() {
  const [tenantId, setTenantId] = useState('')
  const [tenantName, setTenantName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [linesText, setLinesText] = useState('Rent:1200') // simple textarea lines: description:amount
  const [loading, setLoading] = useState(false)

  function parseLines(text:string) {
    return text.split('\n').map(l=>{
      const parts = l.split(':')
      return { description: (parts[0]||'').trim(), amount: Number(parts[1]||0) }
    })
  }

  async function generate(e: React.FormEvent) {
    e.preventDefault()
    if (!tenantId || !tenantName) return alert('Tenant ID and name required')
    setLoading(true)
    try {
      const lines = parseLines(linesText)
      const body = { tenant: { id: tenantId, name: tenantName }, lines, due_date: dueDate }
      const res = await axios.post('/api/invoices/generate', body)
      if (res.data?.ok) {
        alert('Invoice created: ' + res.data.invoice.invoice_number)
        window.open(res.data.invoice.pdf_link, '_blank')
      } else alert('Failed: ' + JSON.stringify(res.data))
    } catch (err:any) {
      console.error(err); alert('Error: ' + (err.message||String(err)))
    } finally { setLoading(false) }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Generate Invoice</h2>
      <div className="card mb-6">
        <form onSubmit={generate} className="space-y-3 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Tenant ID" value={tenantId} onChange={e=>setTenantId(e.target.value)} className="border p-2 w-full rounded" />
            <input placeholder="Tenant Name" value={tenantName} onChange={e=>setTenantName(e.target.value)} className="border p-2 w-full rounded" />
          </div>
          <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="border p-2 w-full rounded" />
          <textarea value={linesText} onChange={e=>setLinesText(e.target.value)} className="border p-2 w-full rounded h-40" />
          <div><button className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>{loading?'Generating...':'Generate Invoice (PDF)'}</button></div>
        </form>
      </div>
    </div>
  )
}
