import React from "react";

interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  date: string;
  description?: string;
}

interface WalletTransactionListProps {
  transactions: Transaction[];
}

export default function WalletTransactionList({
  transactions,
}: WalletTransactionListProps) {
  if (!transactions.length) {
    return <p className="text-sm text-slate-500">No transactions yet.</p>;
  }

  return (
    <ul className="divide-y divide-slate-200">
      {transactions.map((tx) => (
        <li key={tx.id} className="flex justify-between py-2 text-sm">
          <div>
            <p className="font-medium">{tx.description || tx.type}</p>
            <p className="text-xs text-slate-400">
              {new Date(tx.date).toLocaleString()}
            </p>
          </div>
          <p
            className={
              tx.type === "credit"
                ? "text-green-600 font-semibold"
                : "text-red-600 font-semibold"
            }
          >
            {tx.type === "credit" ? "+" : "-"}₦{tx.amount.toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  );
}
