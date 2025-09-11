'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import TenantTable from '../../../components/tables/TenantTable'

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTenants()
  }, [])

  async function loadTenants() {
    setLoading(true)
    try {
      const res = await axios.get('/api/tenants')
      setTenants(res.data || [])
    } catch (e) {
      console.error(e)
      alert('Failed to load tenants')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Tenants</h2>
      </div>

      <div className="card">
        <TenantTable tenants={tenants} />
        {loading && <div className="mt-2 text-sm text-gray-500">Loading...</div>}
      </div>
    </div>
  )
}
