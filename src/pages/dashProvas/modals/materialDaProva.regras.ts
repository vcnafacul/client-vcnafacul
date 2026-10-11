import { SimuladoResumo } from "@/dtos/prova/prova";

export const TEXTO_CARTAO_DA_PROVA = "Cartão da prova";
export const TEXTO_CADERNO_DA_PROVA = "Caderno da prova";
export const MOTIVO_SIMULADOS_INCOMPLETOS =
  "Todos os simulados precisam estar completos";

/**
 * Por que os botões estão desabilitados — `undefined` quando podem baixar. Sem a lista dos
 * simulados ainda (carregando), desabilitado: melhor um instante desabilitado do que um 409.
 */
export function motivoMaterialDaProva(
  simulados: Pick<SimuladoResumo, "bloqueado">[] | undefined,
): string | undefined {
  if (!simulados?.length || simulados.some((s) => s.bloqueado)) {
    return MOTIVO_SIMULADOS_INCOMPLETOS;
  }
  return undefined;
}
