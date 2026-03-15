export function exportAnalyticsCsv(
  headers: string[],
  rows: (string | number)[][],
  fileName: string
): void {
  const BOM = "\uFEFF";
  const headerLine = headers.join(";");
  const dataLines = rows.map((row) => row.join(";"));
  const csvContent = BOM + [headerLine, ...dataLines].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
