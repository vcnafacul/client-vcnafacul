import type { PublicGeolocation } from "@/types/geolocation/publicGeolocation";
import { TypeMarker } from "@/types/map/marker";

/** Área visível do mapa, sem depender do Leaflet (para testar puro). */
export type Limites = {
  norte: number;
  sul: number;
  leste: number;
  oeste: number;
};

export const LIMITE_DESKTOP = 12;
export const LIMITE_CELULAR = 6;

export function dentro(l: Limites, lat: number, lon: number): boolean {
  return lat <= l.norte && lat >= l.sul && lon <= l.leste && lon >= l.oeste;
}

/**
 * Cursinhos na área visível, até `limite`.
 *
 * - Só cursinhos: universidade aparece no mapa, mas não é cadastrável aqui.
 * - ⚠️ Ordem: **cadastro mais recente primeiro.** O card pedia "mais
 *   confirmações, depois `updatedAt`", mas as confirmações são do card 03, e o
 *   `updatedAt` de `geolocations` nunca muda depois da criação (revisão
 *   2026-09-27). Quando o 03 sair, a ordem passa a ser `confirmations` desc.
 */
export function cursinhosNaArea(
  geos: PublicGeolocation[],
  limites: Limites | null,
  limite: number,
): { itens: PublicGeolocation[]; total: number } {
  if (!limites) return { itens: [], total: 0 };
  const naArea = geos
    .filter((g) => g.type === TypeMarker.geo)
    .filter((g) => dentro(limites, g.latitude, g.longitude))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { itens: naArea.slice(0, limite), total: naArea.length };
}

/**
 * Sem acento e sem diferenciar maiúscula — mesma regra das buscas da
 * relatorioSimulado e do gerenciador de inscrições. Quem busca raramente
 * digita o acento ("sao" tem de achar "São").
 */
export function normalizar(texto: string | null | undefined): string {
  return (texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Busca rápida (card 06), no cliente: trecho do nome, apelido, cidade ou
 * estado. Só cursinhos (a tela é para achar cursinho). Mesma ordem da lista.
 */
export function buscarCursinhos(
  geos: PublicGeolocation[],
  termo: string,
): PublicGeolocation[] {
  const t = normalizar(termo);
  if (!t) return [];
  return geos
    .filter((g) => g.type === TypeMarker.geo)
    .filter((g) =>
      [g.name, g.alias, g.city, g.state].some((campo) =>
        normalizar(campo).includes(t),
      ),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** `dd/MM/yyyy` no fuso de quem vê. */
export function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
