"use client";
import Link from "next/link";

export default function InvoiceTable({ invoices }: { invoices: any[] }) {
  return (
    <table className="w-full border">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2">UID</th>
          <th className="p-2">Type</th>
          <th className="p-2">Total</th>
          <th className="p-2">Due</th>
          <th className="p-2">Status</th>
          <th className="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map((inv) => (
          <tr key={inv.id} className="border-t">
            <td className="p-2">{inv.uid}</td>
            <td className="p-2">{inv.type}</td>
            <td className="p-2">{inv.total_amount}</td>
            <td className="p-2">{inv.due_date}</td>
            <td className="p-2">{inv.is_paid ? "Paid" : "Unpaid"}</td>
            <td className="p-2">
              <Link href={`/property-manager/bills/${inv.id}`} className="text-blue-600">View</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
