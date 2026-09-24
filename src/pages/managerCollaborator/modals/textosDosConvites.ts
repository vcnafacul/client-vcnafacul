import type {
  ConviteDoCursinho,
} from "@/services/prepCourse/conviteColaborador";

/**
 * Textos do modal de convites (card 06 de `convite-de-colaborador`).
 *
 * ⚠️ **Módulo próprio** pelo `react-refresh/only-export-components`.
 */

/** "01/10" */
export function dataCurta(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

/** "Pendente — até 01/10" · "Expirado" · "Aceito" · "Cancelado" */
export function textoDaSituacao(c: Pick<ConviteDoCursinho, "situacao" | "expiraEm">): string {
  switch (c.situacao) {
    case "pendente":
      return `Pendente — até ${dataCurta(c.expiraEm)}`;
    case "expirado":
      return "Expirado";
    case "aceito":
      return "Aceito";
    case "cancelado":
      return "Cancelado";
  }
}

export const AVISO_REENVIAR =
  "Reenviar gera um link novo e o anterior deixa de valer. A validade recomeça: 7 dias.";
