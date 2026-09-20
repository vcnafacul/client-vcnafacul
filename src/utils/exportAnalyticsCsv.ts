/**
 * Escapa um valor para uma célula de CSV.
 *
 * ⚠️ **Só age quando precisa.** Um valor sem `;`, aspas ou quebra de linha sai
 * exatamente como entrava antes desta função existir — é o que garante que as
 * sete telas de analytics que já usam este utilitário não mudem de
 * comportamento.
 *
 * ⚠️ A regra das aspas é a do RFC 4180: envolve em `"` e **duplica** as aspas
 * internas. Escapar com barra invertida é o reflexo de quem vem de JSON, e o
 * Excel não entende.
 */
function escaparCelula(valor: string | number | null): string {
  if (valor === null || valor === undefined) return "";

  const texto = String(valor);
  // `\r` entra na conta: um valor colado do Windows traz CRLF, e só checar
  // `\n` deixaria o `\r` solto partir a linha no meio.
  if (!/[;"\n\r]/.test(texto)) return texto;

  return `"${texto.replace(/"/g, '""')}"`;
}

/**
 * Baixa um CSV com `;` como separador.
 *
 * ⚠️ **`;` e não `,`**, e o BOM não é enfeite: é essa combinação que faz o
 * Excel em português abrir o arquivo já separado em colunas e com os acentos
 * certos. Trocar por `,` manda tudo para uma coluna só na máquina de quem usa.
 */
export function exportAnalyticsCsv(
  headers: string[],
  rows: (string | number | null)[][],
  fileName: string
): void {
  // ⚠️ Escape, e não o caractere literal: um BOM invisível no código-fonte
  // some numa normalização de editor sem ninguém ver.
  const BOM = "\uFEFF";
  const headerLine = headers.map(escaparCelula).join(";");
  const dataLines = rows.map((row) => row.map(escaparCelula).join(";"));
  const csvContent = BOM + [headerLine, ...dataLines].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
