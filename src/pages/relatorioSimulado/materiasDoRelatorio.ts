import type {
  LinhaDoRelatorio,
  MediaPorMateria,
} from "@/dtos/relatorioSimulado/relatorioSimulado";

/**
 * Quantas colunas de matéria cabem na tabela.
 *
 * ⚠️ **Medido, não escolhido.** No pior caso — 1565px, quando a sidebar entra
 * no fluxo e tira 16rem (o `xl` deste projeto é 1565px, customizado) — o útil é
 * 1277px. As colunas fixas somam 592px (`turma` 10rem + `situacao` 18rem +
 * `aproveitamento` 9rem) e `estudante` precisa de ~16rem para nome + matrícula.
 * Sobram **429px**, e a 6.5rem (104px) cabem **4**.
 *
 * ⚠️ O pior caso é o relatório do cursinho inteiro, COM a coluna `turma`. No
 * recorte por turma ela some e caberiam 5 — mas um teto que muda de valor
 * conforme a rota faria a mesma turma mostrar conjuntos diferentes de colunas
 * em duas telas, e o coordenador não teria como saber por quê.
 *
 * ⚠️ 4 também é o número de áreas do ENEM, o que torna o caso comum exato. Isso
 * é coincidência feliz e não a razão — se a medição mudar, o número muda.
 */
export const MAXIMO_DE_COLUNAS_DE_MATERIA = 4;

export const LARGURA_DA_COLUNA_DE_MATERIA = "6.5rem";

/**
 * Quais matérias viram coluna, e em que ordem.
 *
 * ⚠️ **Sai do RESUMO, não da varredura das linhas.** O resumo é do recorte
 * inteiro; derivado das linhas, as colunas apareceriam e sumiriam conforme o
 * filtro de busca — e ver uma coluna desaparecer ao digitar um nome é o tipo de
 * comportamento que faz a pessoa desconfiar da tela toda.
 *
 * ⚠️ **Acima do teto, mostra as PIORES da turma.** Não as primeiras
 * alfabeticamente: quem abre o relatório está procurando onde a turma foi mal, e
 * é essa a informação que não pode ficar escondida atrás de um "ver mais". O
 * resto continua no CSV (sem teto) e no modal do card 10.
 */
export function materiasVisiveis(
  doResumo: MediaPorMateria[] | undefined,
  maximo: number = MAXIMO_DE_COLUNAS_DE_MATERIA,
): MediaPorMateria[] {
  if (doResumo === undefined || doResumo.length === 0) return [];
  if (doResumo.length <= maximo) return doResumo;

  // ⚠️ Cópia antes de ordenar: `sort` muda o array no lugar, e este vem do
  // estado da tela — ordenar ali faria a ordem do resumo mudar sozinha.
  const piores = [...doResumo].sort((a, b) => a.media - b.media).slice(0, maximo);

  /*
    ⚠️ E devolve na ordem ORIGINAL do resumo (alfabética, vinda da api), não na
    ordem de pior-para-melhor: a tabela é lida por coluna, e uma ordem que muda
    conforme as notas faria a mesma turma trocar as colunas de lugar entre dois
    simulados. Quem seleciona é a nota; quem ordena é o nome.
  */
  const selecionadas = new Set(piores.map((m) => m.id));
  return doResumo.filter((m) => selecionadas.has(m.id));
}

/**
 * Quantos desvios-padrão abaixo da média da turma marcam a célula.
 *
 * ⚠️ **Um desvio, e não "abaixo da média".** Abaixo da média realça metade da
 * tabela por construção, e realce que aparece em metade das células deixa de
 * apontar para alguma coisa.
 */
export const DESVIOS_PARA_ALERTA = 1;

/**
 * O desvio-padrão da turma em cada matéria.
 *
 * ⚠️ **Derivado aqui porque NÃO está no contrato.** O resumo da api traz média
 * e base por matéria (card 02), não dispersão. Pedi-la ao backend seria uma
 * mudança de contrato para alimentar um realce visual — e o dado para calculá-la
 * já vem na mesma resposta, nas linhas.
 *
 * ⚠️ **Sobre as linhas NÃO filtradas.** Se o desvio saísse da lista filtrada, o
 * realce mudaria a cada busca por nome: a mesma célula ficaria marcada ou não
 * conforme o que a pessoa digitou. A referência é a turma, e turma não muda com
 * filtro de tela.
 *
 * ⚠️ **Só quem tem leitura concluída entra**, o mesmo conjunto que a api usa
 * para a média — senão o desvio seria de uma população e a média de outra.
 *
 * ⚠️ Populacional (divide por `n`): o recorte é a população inteira, não uma
 * amostra dela. Mesma convenção do `pontoBisserial` no ms.
 */
export function desviosPorMateria(
  linhas: LinhaDoRelatorio[],
): Map<string, number> {
  const notas = new Map<string, number[]>();

  for (const linha of linhas) {
    if (linha.status !== "completed") continue;
    for (const materia of linha.aproveitamentoPorMateria ?? []) {
      const lista = notas.get(materia.id) ?? [];
      lista.push(materia.aproveitamento);
      notas.set(materia.id, lista);
    }
  }

  const desvios = new Map<string, number>();
  for (const [id, lista] of notas) {
    const media = lista.reduce((s, n) => s + n, 0) / lista.length;
    const variancia =
      lista.reduce((s, n) => s + (n - media) * (n - media), 0) / lista.length;
    /*
      ⚠️ **Este gate sozinho cobre os dois casos sem dispersão**, e é por isso
      que não há um `if (lista.length < 2)` antes dele: uma nota só tem média
      igual a ela mesma e variância exatamente zero, e a turma toda com a mesma
      nota também. Escrevi a guarda de tamanho primeiro, e a mutação que a
      removia sobrevivia a tudo — era código morto com comentário convincente.

      ⚠️ E o zero importa: desvio 0 faria TODA nota abaixo da média virar
      alerta, que é o oposto de um realce que aponta para alguma coisa.

      ⚠️ `<= 0`, e não `=== 0`: soma de quadrados em float pode dar um negativo
      minúsculo, e `Math.sqrt` de negativo é `NaN`.
    */
    if (variancia <= 0) continue;
    desvios.set(id, Math.sqrt(variancia));
  }

  return desvios;
}

/**
 * A nota do aluno nesta matéria está significativamente abaixo da turma?
 *
 * ⚠️ `false` quando não há desvio para comparar (turma pequena, ou todos com a
 * mesma nota): sem dispersão não existe "significativamente", e marcar mesmo
 * assim transformaria o alerta em ruído.
 */
export function abaixoDaTurma(
  notaDoAluno: number,
  mediaDaTurma: number,
  desvio: number | undefined,
): boolean {
  if (desvio === undefined) return false;
  return notaDoAluno < mediaDaTurma - DESVIOS_PARA_ALERTA * desvio;
}

/** A nota do aluno numa matéria, ou `undefined` se ele não tem aquela matéria. */
export function notaNaMateria(
  linha: LinhaDoRelatorio,
  materiaId: string,
): number | undefined {
  return linha.aproveitamentoPorMateria?.find((m) => m.id === materiaId)
    ?.aproveitamento;
}
