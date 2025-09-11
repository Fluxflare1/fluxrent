import React from 'react'

export default function TenantTable({ tenants = [] }: { tenants: any[] }) {
  if (!tenants || tenants.length === 0) return <div className="text-sm text-gray-500">No tenants yet.</div>

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="text-left">
          <tr className="bg-gray-100"><th className="p-2">Name</th><th>Email</th><th>Phone</th><th>Property</th><th>Unit</th></tr>
        </thead>
        <tbody>
          {tenants.map((t:any) => (
            <tr key={t[0] || t.id} className="border-b">
              <td className="p-2">{t[1] || t.name}</td>
              <td className="p-2">{t[2] || t.email}</td>
              <td className="p-2">{t[3] || t.phone}</td>
              <td className="p-2">{t[5] || t.property}</td>
              <td className="p-2">{t[6] || t.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
