import type { LinhaDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";

/**
 * De onde vêm os dados do relatório (tickets/034): um simulado, ou uma prova —
 * o agregado dos simulados dela.
 *
 * ⚠️ É o que deixa a tela da prova ser **idêntica** à do simulado sem copiar o
 * `RelatorioDoSimuladoConteudo`: o conteúdo não sabe qual das duas está
 * mostrando, só a quem pedir.
 */
export type FonteDoRelatorio =
  | { tipo: "simulado"; simuladoId: string }
  | { tipo: "prova"; provaId: string };

export function idDaFonte(fonte: FonteDoRelatorio): string {
  return fonte.tipo === "simulado" ? fonte.simuladoId : fonte.provaId;
}

/**
 * O simulado do cartão de UMA linha — é por ele que o detalhe do estudante é
 * buscado.
 *
 * ⚠️ **O da linha primeiro.** No relatório da prova o mesmo estudante pode ter
 * cartão em dois simulados, e o da tela não existe. O da fonte só cobre a api
 * antiga, que ainda não manda o campo.
 */
export function simuladoDaLinha(
  fonte: FonteDoRelatorio,
  linha: Pick<LinhaDoRelatorio, "simuladoId">,
): string | undefined {
  return (
    linha.simuladoId ??
    (fonte.tipo === "simulado" ? fonte.simuladoId : undefined)
  );
}

/**
 * O que identifica UMA linha da tabela.
 *
 * ⚠️ `usuario` sozinho nunca foi único — quem se matriculou por dois processos
 * seletivos do mesmo cursinho vem duas vezes, e a `matricula` é que separa. E no
 * relatório da prova (tickets/034) o grão é a APLICAÇÃO: o mesmo estudante com
 * cartão em dois simulados ocupa duas linhas, e o `simuladoId` é que separa.
 */
export function chaveDaLinha(
  linha: Pick<LinhaDoRelatorio, "usuario" | "matricula" | "simuladoId">,
): string {
  return `${linha.usuario}:${linha.matricula}:${linha.simuladoId ?? ""}`;
}
