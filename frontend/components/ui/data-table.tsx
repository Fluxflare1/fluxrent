"use client";

import * as React from "react";

interface Column {
  key: string;
  label: string;
}

interface Pagination {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps {
  data: any[];
  loading?: boolean;
  columns: Column[];
  onRowSelect?: (ids: number[]) => void;
  pagination?: Pagination;
}

export function DataTable({
  data,
  loading,
  columns,
  onRowSelect,
  pagination,
}: DataTableProps) {
  const [selected, setSelected] = React.useState<number[]>([]);

  function toggle(id: number) {
    const newSel = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
    setSelected(newSel);
    onRowSelect?.(newSel);
  }

  if (loading) return <p className="p-4 text-sm">Loading...</p>;

  return (
    <div className="w-full overflow-x-auto border rounded-md">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">
              <input
                type="checkbox"
                checked={selected.length === data.length && data.length > 0}
                onChange={(e) => {
                  const all = e.target.checked ? data.map((d) => d.id) : [];
                  setSelected(all);
                  onRowSelect?.(all);
                }}
              />
            </th>
            {columns.map((col) => (
              <th key={col.key} className="p-2 text-left font-medium">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-t">
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={selected.includes(row.id)}
                  onChange={() => toggle(row.id)}
                />
              </td>
              {columns.map((col) => (
                <td key={col.key} className="p-2">
                  {col.key.split(".").reduce((acc, k) => acc?.[k], row) ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && (
        <div className="flex justify-between items-center p-2 text-sm">
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="space-x-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
