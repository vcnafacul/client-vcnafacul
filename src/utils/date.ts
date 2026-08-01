import { format } from "date-fns";

export const formatDate = (dateString?: string, formatString: string = "dd/MM/yyyy") =>
  dateString ? format(new Date(dateString), formatString) : "";

/** Exibe data+hora local, ex: "10/01/2026 08:00". Vazio se null/undefined. */
export const formatDateTime = (dateString?: string | null) =>
  dateString ? format(new Date(dateString), "dd/MM/yyyy HH:mm") : "";

/**
 * Converte um ISO (UTC) para o valor esperado por <input type="datetime-local">
 * no fuso LOCAL do usuário: "yyyy-MM-ddTHH:mm". Vazio se null/undefined.
 */
export const toDatetimeLocalValue = (dateString?: string | null) =>
  dateString ? format(new Date(dateString), "yyyy-MM-dd'T'HH:mm") : "";
