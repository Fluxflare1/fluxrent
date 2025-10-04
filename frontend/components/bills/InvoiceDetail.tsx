"use client";
import BillItemForm from "./BillItemForm";

export default function InvoiceDetail({ invoice }: { invoice: any }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Invoice {invoice.uid}</h2>
      <p>Type: {invoice.type}</p>
      <p>Total: {invoice.total_amount}</p>
      <p>Due: {invoice.due_date}</p>
      <p>Status: {invoice.is_paid ? "Paid" : "Unpaid"}</p>

      <h3 className="font-semibold mt-4">Items</h3>
      <ul className="list-disc pl-5">
        {invoice.items.map((item: any) => (
          <li key={item.id}>{item.description} - {item.amount}</li>
        ))}
      </ul>

      <BillItemForm invoiceId={invoice.id} />
    </div>
  );
}
