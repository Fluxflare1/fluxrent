import React from 'react'
import Link from 'next/link'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4">
      <div className="mb-6">
        <h3 className="text-lg font-bold">TenantMgmt</h3>
      </div>
      <nav className="space-y-2 text-sm">
        <Link href="/" className="block p-2 rounded hover:bg-gray-100">
          Dashboard
        </Link>
        <Link href="/admin/tenants" className="block p-2 rounded hover:bg-gray-100">
          Tenants
        </Link>
        <Link href="/admin/payments" className="block p-2 rounded hover:bg-gray-100">
          Payments
        </Link>
        <Link href="/admin/tenants/new" className="block p-2 rounded hover:bg-gray-100">
          Add Tenant
        </Link>
      </nav>
    </aside>
  )
}
