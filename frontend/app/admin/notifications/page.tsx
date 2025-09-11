'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

type Notification = {
  id: string
  to_email: string
  to_phone: string
  type: string
  template: string
  status: string
  sent_at: string
  response: string
}

export default function NotificationsAdminPage() {
  const [toEmail, setToEmail] = useState('')
  const [toPhone, setToPhone] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [channels, setChannels] = useState<string[]>(['email'])
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<Notification[]>([])

  useEffect(() => { loadList() }, [])

  async function loadList() {
    try {
      const res = await axios.get('/api/notifications')
      setList(res.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  function toggle(ch: string) {
    setChannels(prev => prev.includes(ch) ? prev.filter(x => x !== ch) : [...prev, ch])
  }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post('/api/notifications', { toEmail, toPhone, subject, message, channels, type: 'manual', template: '' })
      if (res.data?.ok) {
        alert('Sent')
        setToEmail(''); setToPhone(''); setSubject(''); setMessage('')
        loadList()
      } else {
        alert('Failed: ' + JSON.stringify(res.data))
      }
    } catch (err:any) { console.error(err); alert('Error: ' + (err.message||String(err))) } finally { setLoading(false) }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>

      <div className="card mb-6">
        <form onSubmit={send} className="space-y-3 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Email" value={toEmail} onChange={e=>setToEmail(e.target.value)} className="border p-2 w-full rounded" />
            <input placeholder="Phone (+234...)" value={toPhone} onChange={e=>setToPhone(e.target.value)} className="border p-2 w-full rounded" />
          </div>

          <div className="flex gap-4">
            <label><input type="checkbox" checked={channels.includes('email')} onChange={()=>toggle('email')} /> Email</label>
            <label><input type="checkbox" checked={channels.includes('whatsapp')} onChange={()=>toggle('whatsapp')} /> WhatsApp</label>
          </div>

          <input placeholder="Subject" value={subject} onChange={e=>setSubject(e.target.value)} className="border p-2 w-full rounded" />
          <textarea placeholder="Message" value={message} onChange={e=>setMessage(e.target.value)} className="border p-2 w-full rounded h-36" />

          <div><button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Sending...' : 'Send'}</button></div>
        </form>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">Recent Notifications</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100"><tr><th className="p-2">To</th><th>Type</th><th>Status</th><th>Sent</th></tr></thead>
            <tbody>
              {list.map(n => (
                <tr key={n.id} className="border-b">
                  <td className="p-2">{n.to_email || n.to_phone}</td>
                  <td className="p-2">{n.type}</td>
                  <td className="p-2">{n.status}</td>
                  <td className="p-2">{n.sent_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
