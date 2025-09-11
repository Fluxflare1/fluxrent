'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function AssignAgreementPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [templateId, setTemplateId] = useState('')
  const [templateDriveFileId, setTemplateDriveFileId] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const [tRes, tenantsRes] = await Promise.all([axios.get('/api/templates'), axios.get('/api/tenants')])
      setTemplates(tRes.data || [])
      setTenants((tenantsRes.data || []))
    } catch (e) { console.error(e) }
  }

  async function assign(e: React.FormEvent) {
    e.preventDefault()
    if (!templateDriveFileId || !tenantId) return alert('Template and Tenant required')
    setLoading(true)
    try {
      const res = await axios.post('/api/agreements/assign', { template_id: templateId, template_drive_file_id: templateDriveFileId, tenant_id: tenantId })
      if (res.data?.ok) {
        alert('Agreement assigned: ' + res.data.agreement.drive_link)
      } else alert('Failed: ' + JSON.stringify(res.data))
    } catch (err:any) {
      console.error(err); alert('Error: ' + (err.message||String(err)))
    } finally { setLoading(false) }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Assign Agreement to Tenant</h2>

      <div className="card mb-6">
        <form onSubmit={assign} className="space-y-3">
          <div>
            <label className="block text-sm">Template</label>
            <select className="border p-2 w-full rounded" value={templateId} onChange={e=>{
              setTemplateId(e.target.value)
              const tpl = templates.find(t=>t.id===e.target.value)
              setTemplateDriveFileId(tpl?.drive_link ? extractDriveId(tpl.drive_link) : '')
            }}>
              <option value="">Select template</option>
              {templates.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm">Or paste template Drive file ID (optional)</label>
            <input className="border p-2 w-full rounded" value={templateDriveFileId} onChange={e=>setTemplateDriveFileId(e.target.value)} placeholder="Drive file ID" />
          </div>

          <div>
            <label className="block text-sm">Tenant</label>
            <select className="border p-2 w-full rounded" value={tenantId} onChange={e=>setTenantId(e.target.value)}>
              <option value="">Select tenant</option>
              {tenants.map((t:any)=> <option key={t[0] || t.id} value={t[0] || t.id}>{t[1] || t.name}</option>)}
            </select>
          </div>

          <div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Assigning...':'Assign Template'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/** small helper to extract file id from a drive link if user pasted link */
function extractDriveId(link:string) {
  try {
    if (!link) return ''
    const m = link.match(/[-\w]{25,}/)
    return m ? m[0] : link
  } catch { return link }
}
