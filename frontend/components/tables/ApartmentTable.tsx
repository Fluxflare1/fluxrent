import React from 'react'

export default function ApartmentTable({ items = [] }: { items: any[] }) {
  if (!items || items.length === 0) return <div className="text-sm text-gray-500">No apartments yet.</div>
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100"><tr><th className="p-2">Unit</th><th>Property ID</th><th>Type</th><th>Rent</th><th>Status</th><th>Tenant</th></tr></thead>
        <tbody>
          {items.map(a => (
            <tr key={a.id} className="border-b">
              <td className="p-2">{a.unit_number}</td>
              <td className="p-2">{a.property_id}</td>
              <td className="p-2">{a.type}</td>
              <td className="p-2">{a.rent_amount}</td>
              <td className="p-2">{a.status}</td>
              <td className="p-2">{a.tenant_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
