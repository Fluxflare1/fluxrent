// frontend/lib/export.ts
export default function exportToCsv(rows: Record<string, any>[], filename = "export.csv") {
  if (!rows || rows.length === 0) {
    const blob = new Blob([""], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  const keys = Object.keys(rows[0]);
  const csv = [
    keys.join(","),
    ...rows.map((r) =>
      keys
        .map((k) => {
          const v = r[k] ?? "";
          // escape quotes
          const s = String(v).replace(/"/g, '""');
          // wrap in quotes if contains comma/newline/quote
          return /[,"\n]/.test(s) ? `"${s}"` : s;
        })
        .join(",")
    ),
  ].join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Simple HTML table -> .xls exporter (works with Excel)
export function exportToExcelHtml(headers: string[], rows: any[][], filename = "export.xls") {
  const headerRow = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
  const bodyRows = rows
    .map(
      (r) =>
        `<tr>${r
          .map((cell) => `<td>${escapeHtml(cell === null || cell === undefined ? "" : String(cell))}</td>`)
          .join("")}</tr>`
    )
    .join("");
  const html = `<table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
