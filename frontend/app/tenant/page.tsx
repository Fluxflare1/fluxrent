"use client";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useState } from "react";

const tenantNavItems = [
  { label: "Overview", href: "/tenant" },
  { label: "Payments", href: "/tenant/payments" },
  { label: "Maintenance", href: "/tenant/maintenance" },
  { label: "Settings", href: "/tenant/settings" },
];

export default function TenantDashboard() {
  const [payments] = useState([
    { id: 1, date: "2025-08-30", amount: 600, status: "Completed" },
    { id: 2, date: "2025-07-30", amount: 600, status: "Completed" },
    { id: 3, date: "2025-06-30", amount: 600, status: "Completed" },
  ]);

  const [tickets, setTickets] = useState([
    { id: 1, issue: "Leaking faucet", status: "Open" },
    { id: 2, issue: "Broken heater", status: "Resolved" },
  ]);

  const [newIssue, setNewIssue] = useState("");

  const handleAddTicket = () => {
    if (!newIssue.trim()) return;
    setTickets([...tickets, { id: tickets.length + 1, issue: newIssue, status: "Open" }]);
    setNewIssue("");
  };

  return (
    <DashboardLayout title="Tenant Dashboard" navItems={tenantNavItems} sidebarColor="bg-blue-900">
      <h1 className="text-2xl font-bold mb-6">Welcome, Tenant</h1>

      {/* Payments Section */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Payment History</h2>
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border-b">Date</th>
                <th className="p-3 border-b">Amount</th>
                <th className="p-3 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="p-3 border-b">{payment.date}</td>
                  <td className="p-3 border-b">${payment.amount}</td>
                  <td
                    className={`p-3 border-b ${
                      payment.status === "Completed" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {payment.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Maintenance Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Maintenance Requests</h2>
        <div className="bg-white shadow rounded-lg p-4 mb-4">
          <ul className="space-y-2">
            {tickets.map((ticket) => (
              <li
                key={ticket.id}
                className="flex justify-between items-center border-b pb-2 last:border-0"
              >
                <span>{ticket.issue}</span>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    ticket.status === "Open" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {ticket.status}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Add Ticket Form */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Submit New Request</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newIssue}
              onChange={(e) => setNewIssue(e.target.value)}
              placeholder="Describe your issue"
              className="flex-1 border px-3 py-2 rounded-lg"
            />
            <button
              onClick={handleAddTicket}
              className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:opacity-90"
            >
              Submit
            </button>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
