"use client";

import { useEffect, useState } from "react";
import { fetchStatementDetail, StatementOfStay } from "@/lib/api/tenants";
import { useParams } from "next/navigation";

export default function StatementDetailPage() {
  const { id } = useParams();
  const [statement, setStatement] = useState<StatementOfStay | null>(null);

  useEffect(() => {
    if (id) fetchStatementDetail(Number(id)).then(setStatement);
  }, [id]);

  if (!statement) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Statement {statement.uid}</h1>
      <pre className="whitespace-pre-wrap border p-4 bg-gray-50 rounded">{statement.summary}</pre>
    </div>
  );
}
