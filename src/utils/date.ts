import { format } from "date-fns";

const SO_DATA = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Data a partir de texto. ⚠️ "YYYY-MM-DD" (coluna `date` do banco) vira meia-
 * noite LOCAL: `new Date("2026-10-05")` é meia-noite UTC — 21h do dia 4 no
 * Brasil — e toda tela mostrava a data um dia antes. Com hora (ISO), segue o
 * `new Date` de sempre.
 */
export const dataLocal = (dateString: string): Date => {
  const m = SO_DATA.exec(dateString);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(dateString);
};

export const formatDate = (dateString?: string, formatString: string = "dd/MM/yyyy") =>
  dateString ? format(dataLocal(String(dateString)), formatString) : "";

/** Exibe data+hora local, ex: "10/01/2026 08:00". Vazio se null/undefined. */
export const formatDateTime = (dateString?: string | null) =>
  dateString ? format(new Date(dateString), "dd/MM/yyyy HH:mm") : "";

/**
 * Converte um ISO (UTC) para o valor esperado por <input type="datetime-local">
 * no fuso LOCAL do usuário: "yyyy-MM-ddTHH:mm". Vazio se null/undefined.
 */
export const toDatetimeLocalValue = (dateString?: string | null) =>
  dateString ? format(new Date(dateString), "yyyy-MM-dd'T'HH:mm") : "";
