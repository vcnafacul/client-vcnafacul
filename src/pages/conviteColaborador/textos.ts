import type { SituacaoDoConvite } from "@/services/prepCourse/conviteColaborador";

/**
 * O que dizer a quem abre um link que não vale mais.
 *
 * ⚠️ **Módulo próprio** pelo `react-refresh/only-export-components`.
 */
export const MENSAGEM_DA_SITUACAO: Record<
  Exclude<SituacaoDoConvite, "pendente">,
  string
> = {
  expirado:
    "Este convite expirou. Peça à coordenação do cursinho que envie um novo.",
  aceito: "Este convite já foi aceito.",
  cancelado: "Este convite foi cancelado pela coordenação do cursinho.",
};
