import React from 'react'

export default function RentScheduleTable({ items = [], onMarkPaid }: { items: any[], onMarkPaid?: (s:any)=>void }) {
  if (!items || items.length === 0) return <div className="text-sm text-gray-500">No rent schedules yet.</div>
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100"><tr><th className="p-2">Apartment</th><th>Tenant</th><th>Period</th><th>Due Date</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          {items.map(i => (
            <tr key={i.id} className="border-b">
              <td className="p-2">{i.apartment_id}</td>
              <td className="p-2">{i.tenant_name}</td>
              <td className="p-2">{i.period}</td>
              <td className="p-2">{i.due_date}</td>
              <td className="p-2">{i.amount}</td>
              <td className="p-2">{i.status}</td>
              <td className="p-2">
                {i.status !== 'paid' && <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={()=>onMarkPaid && onMarkPaid(i)}>Mark Paid</button>}
                {i.status === 'paid' && <span className="text-sm text-gray-600">Paid</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
