export function exportAnalyticsCsv(
  headers: string[],
  rows: (string | number | null)[][],
  fileName: string
): void {
  const BOM = "\uFEFF";
  const headerLine = headers.join(";");
  const dataLines = rows.map((row) => row.map((v) => v ?? "").join(";"));
  const csvContent = BOM + [headerLine, ...dataLines].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
