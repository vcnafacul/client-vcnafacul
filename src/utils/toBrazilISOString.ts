// utils/dateUtils.ts
import { DateTime } from 'luxon';

/**
 * Converte qualquer data para uma string ISO no fuso horário de Brasília (America/Sao_Paulo),
 * com o offset de -03:00 (ou -02:00 no horário de verão, se ativo).
 *
 * @param date Date, string ISO ou timestamp
 * @returns string ISO no fuso horário de Brasília
 */
export function toBrazilISOString(date: Date | string | number): string | null {
  return DateTime.fromJSDate(new Date(date))
    .setZone('America/Sao_Paulo')
    .toISO(); // ex: "2025-06-04T20:43:00.000-03:00"
}


/**
 * Converte uma data para o início do dia (00:00:00) no fuso horário de Brasília.
 *
 * @param date Date, string ISO ou timestamp
 * @returns string ISO representando meia-noite do dia no fuso de Brasília
 */
export function toBrazilStartOfDayISOString(date: Date | string | number): string | null {
  return DateTime.fromJSDate(new Date(date))
    .setZone('America/Sao_Paulo')
    .startOf('day') // 00:00:00
    .toISO();       // Ex: "2025-06-04T00:00:00.000-03:00"
}