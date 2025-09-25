// frontend/components/listings/Pagination.tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import qs from "qs";

export default function Pagination({ page, page_size, total_count }: { page: number; page_size: number; total_count: number; }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pages = Math.max(1, Math.ceil((total_count || 0) / (page_size || 12)));

  const goto = (p: number) => {
    const current = Object.fromEntries(Array.from(searchParams || new URLSearchParams()));
    const next = { ...current, page: p };
    const qsStr = qs.stringify(next, { addQueryPrefix: true, arrayFormat: "brackets" });
    router.push(`/properties${qsStr}`);
  };

  return (
    <div className="flex items-center justify-between py-4">
      <div className="text-sm text-gray-600">Page {page} of {pages}</div>
      <div className="flex gap-2">
        <button disabled={page <= 1} onClick={() => goto(page - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
        <button disabled={page >= pages} onClick={() => goto(page + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}
