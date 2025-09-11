'use client'
import React, { useState } from 'react'
import axios from 'axios'

export default function NotificationsPage() {
  const [toEmail, setToEmail] = useState('')
  const [toPhone, setToPhone] = useState('')
  const [channels, setChannels] = useState<string[]>(['email'])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post('/api/notifications/send', { toEmail, toPhone, channels, subject, message, type: 'manual', template: '' })
      if (res.data?.ok) alert('Sent'); else alert('Failed: ' + JSON.stringify(res.data))
    } catch (err:any) {
      console.error(err); alert('Error: ' + (err.message||String(err)))
    } finally { setLoading(false) }
  }

  function toggleChannel(ch:string) {
    setChannels(prev => prev.includes(ch) ? prev.filter(x=>x!==ch) : [...prev, ch])
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Send Notification</h2>
      <div className="card mb-6">
        <form onSubmit={send} className="space-y-3 max-w-2xl">
          <input placeholder="to email" value={toEmail} onChange={e=>setToEmail(e.target.value)} className="border p-2 w-full rounded" />
          <input placeholder="to phone (+234...)" value={toPhone} onChange={e=>setToPhone(e.target.value)} className="border p-2 w-full rounded" />
          <div className="flex gap-3">
            <label><input type="checkbox" checked={channels.includes('email')} onChange={()=>toggleChannel('email')} /> Email</label>
            <label><input type="checkbox" checked={channels.includes('whatsapp')} onChange={()=>toggleChannel('whatsapp')} /> WhatsApp</label>
          </div>
          <input placeholder="subject" value={subject} onChange={e=>setSubject(e.target.value)} className="border p-2 w-full rounded" />
          <textarea placeholder="message" value={message} onChange={e=>setMessage(e.target.value)} className="border p-2 w-full rounded h-32" />
          <div><button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Sending...':'Send'}</button></div>
        </form>
      </div>
    </div>
  )
}
