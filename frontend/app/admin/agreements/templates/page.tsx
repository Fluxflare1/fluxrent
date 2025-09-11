'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function TemplatesPage() {
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadTemplates() }, [])

  async function loadTemplates() {
    try {
      const res = await axios.get('/api/templates')
      setTemplates(res.data || [])
    } catch (e) { console.error(e) }
  }

  async function upload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return alert('Choose a file')
    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('name', name)
      const res = await axios.post('/api/templates/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      if (res.data?.ok) {
        alert('Template uploaded')
        setFile(null); setName('')
        loadTemplates()
      } else {
        alert('Upload failed: ' + JSON.stringify(res.data))
      }
    } catch (err:any) {
      console.error(err); alert('Error: ' + (err.message||String(err)))
    } finally { setLoading(false) }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Agreement Templates</h2>

      <div className="card mb-6">
        <form onSubmit={upload} className="space-y-3">
          <input placeholder="Template name (optional)" value={name} onChange={e=>setName(e.target.value)} className="border p-2 w-full rounded" />
          <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
          <div><button className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Uploading...':'Upload Template'}</button></div>
        </form>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">Available Templates</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100"><tr><th className="p-2">Name</th><th>Link</th><th>Created</th></tr></thead>
            <tbody>
              {templates.map(t => (
                <tr key={t.id} className="border-b">
                  <td className="p-2">{t.name}</td>
                  <td className="p-2"><a href={t.drive_link} target="_blank" rel="noreferrer" className="text-blue-600">Open</a></td>
                  <td className="p-2">{t.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
