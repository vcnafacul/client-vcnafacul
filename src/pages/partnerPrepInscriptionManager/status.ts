import type { StatusV2 } from "@/components/dashV2";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { Inscription } from "@/types/partnerPrepCourse/inscription";

/**
 * O status que a tela mostra e filtra — **uma função só** (card 01 da série
 * `tickets/021-dash-v2-processo-seletivo`).
 *
 * ⚠️ Antes eram duas: o card comparava `inscription.endDate < new Date()` com
 * o `endDate` chegando da api como string ISO — string contra `Date` vira
 * `NaN`, a comparação dava sempre `false`, e um processo encerrado aparecia
 * como ativo. O filtro acertava, então filtrar por "Encerrado" mostrava cards
 * dizendo "Ativo".
 *
 * `new Date(...)` aqui de propósito: aceita `Date` e string, e não depende de
 * quem chamou ter convertido.
 */
export function statusDoProcesso(
  inscription: Pick<Inscription, "endDate" | "actived">,
  agora: Date = new Date(),
): StatusEnum {
  if (new Date(inscription.endDate) < agora) return StatusEnum.Rejected;
  return inscription.actived;
}

/**
 * Rótulo e tom do `StatusBadge` (card 04). Os rótulos são os do filtro de
 * status (`data.ts`), para a coluna e o filtro falarem a mesma língua.
 */
export function badgeDoProcesso(
  inscription: Pick<Inscription, "endDate" | "actived">,
  agora: Date = new Date(),
): { tone: StatusV2; label: string } {
  switch (statusDoProcesso(inscription, agora)) {
    case StatusEnum.Approved:
      return { tone: "running", label: "Ativo" };
    case StatusEnum.Rejected:
      return { tone: "done", label: "Encerrado" };
    default:
      return { tone: "neutral", label: "Pendente" };
  }
}
