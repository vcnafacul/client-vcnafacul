import type {
  LinhaDoRelatorio,
  QuestaoDoRelatorio,
} from "@/dtos/relatorioSimulado/relatorioSimulado";
import { rotulosDasFlags } from "./flagsDaQuestao";
import { statusDaLinha } from "./statusDaLinha";
import {
  percentualDaAlternativa,
  percentualDeAcerto,
  percentualDeErro,
} from "./percentuais";

const ALTERNATIVAS = ["A", "B", "C", "D", "E"] as const;

/**
 * Uma planilha, pronta para o `exportAnalyticsCsv`.
 *
 * ⚠️ O tipo de `linhas` é o que aquele utilitário aceita — `null` vira célula
 * vazia lá. Devolver `undefined` aqui produziria a string "undefined" no
 * arquivo.
 */
export interface Planilha {
  cabecalho: string[];
  linhas: (string | number | null)[][];
}

/**
 * ⚠️ **Percentual vai como NÚMERO, sem o "%".** No Excel pt-BR, "60%" numa
 * célula é texto e não soma nem ordena; 60 é número. Quem abre a planilha quer
 * justamente fazer conta com isso — é a razão de exportar em vez de olhar a
 * tela.
 *
 * ⚠️ E `null`, não `0`, quando não há base: zero afirma "ninguém acertou", e
 * ausência de respondente é outra coisa. Célula vazia é o que a planilha
 * entende como "sem dado".
 */
const numero = (valor: number | null): number | null => valor;

/**
 * A aba de estudantes.
 *
 * ⚠️ Recebe as linhas **já filtradas** pela tela: o arquivo é o que está
 * visível, como a impressão. Quem quer o recorte inteiro limpa o filtro antes.
 *
 * ⚠️ O aproveitamento sai como número de 0 a 100, não como a fração que a api
 * manda — a tela já mostra em porcentagem, e a planilha que discordasse da
 * tela seria pior que não existir.
 */
export function planilhaDeEstudantes(
  linhas: LinhaDoRelatorio[],
  opcoes: { comTurma: boolean },
): Planilha {
  const cabecalho = [
    "Estudante",
    "Matrícula",
    ...(opcoes.comTurma ? [] : ["Turma"]),
    "Situação",
    "Aproveitamento (%)",
    "Cartão",
    "Motivo da falha",
  ];

  const linhasCsv = linhas.map((l) => [
    l.nome,
    l.matricula,
    // ⚠️ A coluna Turma some quando o relatório já é de UMA turma — repetir o
    // mesmo nome em todas as linhas não informa nada. Mesma regra da tabela.
    ...(opcoes.comTurma ? [] : [l.turmaNome ?? null]),
    statusDaLinha(l).label,
    /*
      ⚠️ Só para quem tem leitura concluída. O `marcarFalha` do ms NÃO limpa o
      `aproveitamento`, então uma linha `failed` pode carregar nota velha — a
      tabela já esconde por isso, e a planilha tem de esconder igual, senão
      vira a fonte "oficial" de um número que a tela recusa mostrar.
    */
    l.status === "completed" && typeof l.aproveitamentoGeral === "number"
      ? Math.round(l.aproveitamentoGeral * 100)
      : null,
    l.cartaoCode ?? null,
    l.status === "failed" ? l.falha?.descricao ?? null : null,
  ]);

  return { cabecalho, linhas: linhasCsv };
}

/** A aba de desempenho por questão. */
export function planilhaDeQuestoes(questoes: QuestaoDoRelatorio[]): Planilha {
  /*
    ⚠️ **A planilha MANTÉM `Acertos`, `Erros` e `Erro (%)`, que o card 04
    removeu da tabela.** Não é esquecimento.

    Tela e arquivo seguem critérios diferentes de propósito: a tela é para ler
    e comparar entre linhas, e ali redundância atrapalha — `Acerto (%)` é a
    coluna do gabarito, `Erros` sai por subtração. O arquivo é para fazer conta
    em cima, e quem quer `% de erro` sem calcular tem o CSV. É a mesma razão
    pela qual `respondentes` sempre esteve aqui e não estava lá (até este card).
  */
  const cabecalho = [
    "Questão",
    "Respondentes",
    "Gabarito",
    "Acertos",
    "Erros",
    "Sem leitura",
    ...ALTERNATIVAS.map((a) => `${a} (%)`),
    "Acerto (%)",
    "Erro (%)",
    /*
      ⚠️ **`Discriminação` e `Sinais` existem no arquivo e NÃO na tabela como
      colunas próprias** — foi a decisão do card 19. Um `r` entre −1 e +1 numa
      tela de coordenador é precisão que não ajuda a decidir nada e custa
      largura; numa planilha é justamente o que se ordena e se filtra.
    */
    "Discriminação",
    /*
      ⚠️ **Uma coluna de texto, não seis booleanas.** Seis colunas de 0/1 numa
      planilha de 180 linhas é pior de filtrar que uma coluna com os rótulos —
      e some com a informação de quantos sinais a questão acumula.
    */
    "Sinais",
  ];

  const linhas = questoes.map((q) => [
    q.numero ?? null,
    /*
      ⚠️ `respondentes` entra na planilha, embora não esteja na tabela: é o
      denominador de todos os percentuais ao lado, e sem ele quem abre o
      arquivo não consegue refazer nenhuma conta — que é o motivo de exportar.
    */
    q.respondentes,
    // ⚠️ Vazio, e não "—": a célula do CSV é para ser lida por planilha, e um
    // travessão vira texto no meio de uma coluna de letras.
    q.alternativaCorreta ?? null,
    q.acertos,
    q.erros,
    q.semLeitura,
    ...ALTERNATIVAS.map((a) => numero(percentualDaAlternativa(q, a))),
    numero(percentualDeAcerto(q)),
    numero(percentualDeErro(q)),
    // ⚠️ `null` atravessa como célula vazia: é "não há como medir", e um zero
    // afirmaria "não separa ninguém" — ver o DTO.
    q.discriminacao,
    // ⚠️ String vazia, e não `null`: aqui a ausência de sinal É a informação
    // ("esta questão está ok"), diferente de uma medida que não existe.
    rotulosDasFlags(q),
  ]);

  return { cabecalho, linhas };
}

/**
 * Nome do arquivo, sem a extensão — o `exportAnalyticsCsv` acrescenta `.csv`.
 *
 * ⚠️ Sem `/` nem `:`: os dois são separadores de caminho em algum sistema, e
 * um nome de simulado com barra produziria um download recusado em silêncio.
 */
export function nomeDoArquivo(
  prefixo: string,
  simuladoId: string,
  turmaId?: string,
): string {
  const data = new Date().toISOString().slice(0, 10);
  const recorte = turmaId ? `-turma-${turmaId}` : "";
  return `${prefixo}-${simuladoId}${recorte}-${data}`.replace(/[/:\\]/g, "-");
}
