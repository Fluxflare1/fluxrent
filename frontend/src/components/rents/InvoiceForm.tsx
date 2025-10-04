"use client";

import { useState } from "react";
import { RentService } from "@/services/rent.service";
import { RentInvoice } from "@/types/rent.types";

interface Props {
  tenancyId: number;
  onSuccess: () => void;
}

export default function InvoiceForm({ tenancyId, onSuccess }: Props) {
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await RentService.generateInvoice({ tenancy_id: tenancyId, due_date: dueDate, amount });
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg shadow">
      <h3 className="font-semibold">Generate Invoice</h3>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Saving..." : "Create Invoice"}
      </button>
    </div>
  );
}
