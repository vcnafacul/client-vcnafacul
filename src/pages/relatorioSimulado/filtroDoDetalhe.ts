import type { RespostaDoEstudante } from "@/dtos/relatorioSimulado/relatorioSimulado";

/**
 * ⚠️ **Sem `acertou`.** Ninguém abre o modal para ver o que o aluno acertou, e
 * um quarto chip custa largura e atenção sem entregar nada.
 */
export type FiltroDoDetalhe = "tudo" | "errou" | "sem_leitura";

/** `Tudo` é o padrão — este card não muda o que se vê ao abrir. */
export const FILTRO_PADRAO: FiltroDoDetalhe = "tudo";

export const ROTULO_DO_FILTRO: Record<FiltroDoDetalhe, string> = {
  tudo: "Tudo",
  errou: "Errou",
  sem_leitura: "Sem leitura",
};

/** A ordem dos chips na tela. */
export const FILTROS: readonly FiltroDoDetalhe[] = [
  "tudo",
  "errou",
  "sem_leitura",
];

/**
 * Quantas respostas cada chip tem.
 *
 * ⚠️ **O contador faz parte do rótulo**, como o toggle "Mostrar quem não
 * enviou" da tela já faz: sem ele, uma tabela de 19 linhas num simulado de 90
 * fica sem explicação. E é o número que diz se vale acionar o filtro.
 */
export function contagensDoDetalhe(
  respostas: RespostaDoEstudante[],
): Record<FiltroDoDetalhe, number> {
  return {
    tudo: respostas.length,
    errou: respostas.filter((r) => r.resultado === "erro").length,
    sem_leitura: respostas.filter((r) => r.resultado === "sem_leitura").length,
  };
}

/**
 * Aplica o filtro.
 *
 * ⚠️ **Remove linhas, não reordena.** A tabela continua sem `onSortChange` — a
 * ordem é a do ms, por número da questão, e o docblock de lá explica que
 * reordenar por resultado "não acrescenta nada que não se veja de relance". O
 * filtro não conflita com isso.
 *
 * ⚠️ **`errou` é só `erro`**, e não "tudo que não é acerto". O
 * `rotuloDoResultado` documenta que juntar erro e sem-leitura "distorce
 * exatamente a leitura que o professor faz para decidir o que revisar em aula"
 * — a tela classifica os três estados com cuidado justamente para distingui-los.
 */
export function filtrarRespostas(
  respostas: RespostaDoEstudante[],
  filtro: FiltroDoDetalhe,
): RespostaDoEstudante[] {
  if (filtro === "tudo") return respostas;
  if (filtro === "errou") return respostas.filter((r) => r.resultado === "erro");
  return respostas.filter((r) => r.resultado === "sem_leitura");
}
