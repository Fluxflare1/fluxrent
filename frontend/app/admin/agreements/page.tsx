"use client"
import { useState } from "react"
import axios from "axios"

export default function AgreementsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [tenantId, setTenantId] = useState("")

  async function upload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return alert("Choose a file")
    const form = new FormData()
    form.append("file", file)
    form.append("tenant_id", tenantId)
    const res = await axios.post("/api/agreements/upload", form, { headers: { "Content-Type": "multipart/form-data" } })
    if (res.data.ok) alert("Uploaded: " + res.data.file.webViewLink)
    else alert("Upload failed")
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Upload Agreement</h2>
      <form onSubmit={upload} className="space-y-3 max-w-xl">
        <input placeholder="Tenant ID" value={tenantId} onChange={e=>setTenantId(e.target.value)} className="border p-2 w-full" />
        <input type="file" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Upload</button>
      </form>
    </div>
  )
}
