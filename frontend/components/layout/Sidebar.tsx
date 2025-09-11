import React from 'react'
import Link from 'next/link'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4">
      <div className="mb-6">
        <h3 className="text-lg font-bold">TenantMgmt</h3>
      </div>
      <nav className="space-y-2 text-sm">
        <Link href="/"><a className="block p-2 rounded hover:bg-gray-100">Dashboard</a></Link>
        <Link href="/admin/tenants"><a className="block p-2 rounded hover:bg-gray-100">Tenants</a></Link>
        <Link href="/admin/payments"><a className="block p-2 rounded hover:bg-gray-100">Payments</a></Link>
        <Link href="/admin/tenants/new"><a className="block p-2 rounded hover:bg-gray-100">Add Tenant</a></Link>
      </nav>
    </aside>
  )
}
