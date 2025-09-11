import React from 'react'

export default function PropertyTable({ items = [] }: { items: any[] }) {
  if (!items || items.length === 0) return <div className="text-sm text-gray-500">No properties yet.</div>
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100"><tr><th className="p-2">Name</th><th>Address</th><th>Units</th><th>City</th></tr></thead>
        <tbody>
          {items.map(p => (
            <tr key={p.id} className="border-b">
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.address}</td>
              <td className="p-2">{p.num_units}</td>
              <td className="p-2">{p.city}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
