"use client";

import { useEffect, useState } from "react";
import { fetchStatements, StatementOfStay } from "@/lib/api/tenants";
import Link from "next/link";

export default function StatementsPage() {
  const [statements, setStatements] = useState<StatementOfStay[]>([]);

  useEffect(() => {
    fetchStatements().then(setStatements);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Statements of Stay</h1>
      <ul className="space-y-3">
        {statements.map(st => (
          <li key={st.id} className="p-3 border rounded">
            <p><strong>{st.uid}</strong> — Apartment ID: {st.tenant_apartment}</p>
            <p>Issued: {new Date(st.issued_at).toLocaleDateString()}</p>
            <Link href={`/tenants/statements/${st.id}`} className="text-blue-600 underline">View</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
