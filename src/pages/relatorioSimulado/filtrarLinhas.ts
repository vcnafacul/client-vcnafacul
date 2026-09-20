import type { LinhaDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";

/**
 * Normaliza para comparar busca: minúsculas e **sem acento**.
 *
 * ⚠️ Sem o `normalize("NFD")` uma busca por "jose" não acha "José", e quem
 * digita o nome de um estudante raramente digita o acento. A faixa
 * `̀-ͯ` é a dos diacríticos combinantes, que é o que o NFD separa
 * das letras.
 */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export interface FiltroDoRelatorio {
  /** Quando `false`, some com as linhas de quem não enviou cartão. */
  mostrarQuemNaoEnviou: boolean;
  /** Texto livre casado contra nome e matrícula. Vazio não filtra nada. */
  busca: string;
}

/**
 * Aplica os dois filtros da tela, nesta ordem.
 *
 * ⚠️ **Nenhum dos dois vai ao servidor, de propósito.** A rota do relatório não
 * é paginada (`buscarRelatorio` não manda `page` nem `limit`): o recorte inteiro
 * já está em memória, então filtrar aqui é instantâneo e não gasta viagem.
 *
 * ⚠️ E o filtro **não** mexe no `resumo`. Os números do topo descrevem o
 * recorte, não o que está visível — é o contrato deles com quem coordena
 * ("27 de 30 enviaram"). Se o filtro os alterasse, esconder as linhas mudaria
 * o denominador e a tela passaria a dizer que 100% enviou.
 */
export function filtrarLinhas(
  linhas: LinhaDoRelatorio[],
  filtro: FiltroDoRelatorio,
): LinhaDoRelatorio[] {
  const termo = normalizar(filtro.busca);

  return linhas.filter((l) => {
    if (!filtro.mostrarQuemNaoEnviou && !l.enviouCartao) return false;
    if (termo === "") return true;

    return (
      normalizar(l.nome).includes(termo) ||
      normalizar(l.matricula).includes(termo)
    );
  });
}

/**
 * Quantas linhas o toggle está escondendo agora.
 *
 * ⚠️ Existe para o rótulo do toggle dizer o número. Sem ele a tabela mostra 1
 * linha enquanto o resumo diz "2 estudantes no recorte", e a diferença fica
 * sem explicação na tela — o tipo de coisa que vira chamado de suporte.
 *
 * ⚠️ Conta **sobre a lista inteira**, ignorando a busca: é resposta para
 * "quem mais existe neste recorte", não para "o que sobrou do que eu digitei".
 */
export function totalQueNaoEnviou(linhas: LinhaDoRelatorio[]): number {
  return linhas.filter((l) => !l.enviouCartao).length;
}
