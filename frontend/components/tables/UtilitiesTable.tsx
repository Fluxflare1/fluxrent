// frontend/components/tables/UtilitiesTable.tsx
import React from 'react'

export default function UtilitiesTable({ items = [] }: { items: any[] }) {
  if (!items || items.length === 0) return <div className="text-sm text-gray-500">No utilities recorded yet.</div>

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2">Tenant ID</th>
            <th className="p-2">Month</th>
            <th className="p-2">LAWMA</th>
            <th className="p-2">Cleaner</th>
            <th className="p-2">Water</th>
            <th className="p-2">Misc</th>
            <th className="p-2">Bank</th>
            <th className="p-2">Total</th>
            <th className="p-2">Recorded</th>
          </tr>
        </thead>
        <tbody>
          {items.map((u:any) => (
            <tr key={u.id} className="border-b">
              <td className="p-2">{u.tenant_id}</td>
              <td className="p-2">{u.month}</td>
              <td className="p-2">{u.LAWMA}</td>
              <td className="p-2">{u.Cleaner}</td>
              <td className="p-2">{u.Water}</td>
              <td className="p-2">{u.Misc}</td>
              <td className="p-2">{u.BankCharges}</td>
              <td className="p-2 font-semibold">{u.total}</td>
              <td className="p-2">{new Date(u.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
