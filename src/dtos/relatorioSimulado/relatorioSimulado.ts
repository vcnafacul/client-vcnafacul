import { FalhaHistorico } from "../cartaoResposta/resultados";

/**
 * O status de um cartão no relatório.
 *
 * ⚠️ **União própria, não o `HistoricoStatus` de `historico/historicoDTO.ts`.**
 * Aquele é `'pending' | 'processing' | 'completed' | 'failed'` — está
 * desatualizado (não tem `awaiting_omr`) e é consumido pela tela do estudante.
 * Acrescentar valor lá para servir a esta tela arrisca a outra.
 */
export type StatusDoCartao =
  | "pending"
  | "processing"
  | "awaiting_omr"
  | "completed"
  | "failed";

export interface LinhaDoRelatorio {
  usuario: string;
  nome: string;
  matricula: string;
  turmaId: string | null;
  turmaNome: string | null;
  /**
   * ⚠️ Explícito de propósito. **Não inferir de `historicoId` ausente** — a api
   * manda este campo justamente para ninguém inferir e inferir errado.
   */
  enviouCartao: boolean;
  historicoId?: string;
  status?: StatusDoCartao;
  cartaoCode?: string;
  /**
   * Quantas questões saíram com marcação legível — "leu 87 de 90".
   *
   * ⚠️ **Era sempre `undefined` aqui, e deixou de ser** (card 01): o fluxo do
   * cartão não gravava o campo, porque o único escritor era o `createPending`
   * do fluxo digital. Hoje o `completeProcessing` grava nos dois, derivado das
   * respostas já normalizadas.
   *
   * ⚠️ Segue opcional: histórico gravado ANTES daquele card não tem o campo, e
   * linha sem leitura concluída também não. Ausente ≠ zero questões lidas.
   */
  questoesRespondidas?: number;
  /**
   * ⚠️ **Pode vir preenchido com nota VELHA numa linha `failed`.** O
   * `marcarFalha` do ms não limpa `aproveitamento`, e a api repassa como veio
   * — de propósito, ela não reescreve o que o ms disse. Quem decide não
   * mostrar é a tela. Ver `colunas.tsx`.
   */
  aproveitamentoGeral?: number;
  /**
   * Nota por matéria, com as frentes dentro — o que responde "em QUÊ o aluno
   * foi mal", e não só quanto acertou.
   *
   * ⚠️ **Opcional, e ausente nunca é `[]`.** Histórico anterior ao
   * `criaAproveitamento`, leitura não concluída, ou cartão em que nenhuma
   * questão casou com matéria: nos três, lista vazia faria a tela desenhar
   * barra em zero e afirmar que o aluno zerou TODAS as matérias.
   *
   * ⚠️ Mesmo cuidado do `aproveitamentoGeral`: pode vir preenchido numa linha
   * `failed` com nota VELHA — o `marcarFalha` do ms não limpa `aproveitamento`.
   * Quem decide não mostrar é a tela, via `leituraVale`.
   */
  aproveitamentoPorMateria?: MateriaDoEstudante[];
  falha?: FalhaHistorico;
}

export interface FrenteDoEstudante {
  id: string;
  nome: string;
  /** Fração de 0 a 1 — a tela é quem formata. */
  aproveitamento: number;
}

export interface MateriaDoEstudante {
  id: string;
  nome: string;
  aproveitamento: number;
  /** ⚠️ Drill-down do modal (card 10), NUNCA coluna: 15+ frentes não cabem. */
  frentes: FrenteDoEstudante[];
}

export interface MediaPorMateria {
  id: string;
  nome: string;
  media: number;
  /**
   * Quantos estudantes entraram NESTA média.
   *
   * ⚠️ Não é o mesmo número para toda matéria: quem não teve questão daquela
   * matéria lida não entra no denominador dela. "42% em Química" sobre 3 alunos
   * é verdadeiro e inútil sem o "de 3".
   */
  base: number;
}

export interface ResumoDoRelatorio {
  totalNoRecorte: number;
  comLeituraConcluida: number;
  aproveitamentoGeral: number | null;
  totalEstudantesComCartaoNoCursinho: number;
  temEstudanteSemTurma: boolean;
  /** Quem saiu do cursinho depois de enviar. ⚠️ Contado, nunca listado. */
  linhasSemEstudanteAtivo: number;
  /**
   * A nota da turma em cada matéria — a referência sem a qual "30% em
   * Matemática" não é diagnóstico nenhum.
   *
   * ⚠️ **É daqui que saem as COLUNAS da tabela, não da varredura das linhas.**
   * O conjunto aqui é o do recorte inteiro; derivado das linhas, as colunas
   * apareceriam e sumiriam conforme o filtro — uma busca por nome podendo
   * remover uma coluna da tabela.
   *
   * ⚠️ Ausente quando ninguém do recorte tem matéria nenhuma. `[]` faria a tela
   * desenhar um gráfico vazio afirmando que a turma não tem matérias.
   */
  aproveitamentoPorMateria?: MediaPorMateria[];
}

export interface RelatorioDoSimulado {
  linhas: LinhaDoRelatorio[];
  resumo: ResumoDoRelatorio;
}

export interface QuestaoDoRelatorio {
  numero: number | null;
  questaoId: string;
  respondentes: number;
  acertos: number;
  erros: number;
  /**
   * ⚠️ `semLeitura`, não "em branco": o ms-omr descarta questão em branco e
   * dupla marcação do mesmo jeito, então os dois chegam indistinguíveis.
   */
  semLeitura: number;
  porAlternativa: Record<string, number>;
  /**
   * O gabarito, sem o qual as contagens de `porAlternativa` não são
   * interpretáveis: "51% marcaram B" é a turma acertando em peso ou meia turma
   * caindo no mesmo distrator, e são leituras opostas.
   *
   * ⚠️ **`null` em dois casos, e a tela não pode presumir qual** (card 03):
   * nenhum histórico completo no recorte, ou históricos que DISCORDAM (questão
   * editada entre duas aplicações, ou duplicada no simulado). `null` é "não
   * sei" — nunca destacar a mais marcada por palpite.
   *
   * ⚠️ Quando não é nulo, vale `porAlternativa[alternativaCorreta] === acertos`
   * — é por isso que `% de acerto` e a coluna da correta são o MESMO número, e
   * o card 04 removeu uma delas da tela.
   */
  alternativaCorreta: string | null;
  /**
   * A correlação ponto-bisserial entre acertar a questão e a nota da prova:
   * **a questão separa quem sabe de quem não sabe?**
   *
   * É o que a dificuldade sozinha não diz. "22% acertaram" pode ser uma questão
   * difícil e boa — os 22% são quem foi bem na prova — ou uma questão quebrada,
   * em que acertou quem chutou. As ações são opostas.
   *
   * ⚠️ **Negativo é o sinal clássico de gabarito trocado** (os melhores
   * errando mais que os piores).
   *
   * ⚠️ **`null` NÃO é zero.** Zero diria "não separa ninguém"; `null` diz que
   * não há como medir — menos de 10 estudantes com LEITURA da questão, ou
   * variância zero. Nunca use um padrão no lugar: `flagsDaQuestao` trata
   * ausência como ausência de sinal, nunca como "item fraco".
   */
  discriminacao: number | null;
}

export interface QuestoesDoRelatorio {
  questoes: QuestaoDoRelatorio[];
}

export interface SimuladoComCartao {
  simuladoId: string;
  nome: string | null;
  /** Quantos ESTUDANTES enviaram, não quantas fotos chegaram. */
  cartoes: number;
  comLeituraConcluida: number;
  ultimoEnvio: string | null;
}

export interface SimuladosComCartao {
  simulados: SimuladoComCartao[];
}

/**
 * ⚠️ Três estados, não dois. E é `sem_leitura`, não `em_branco`: o ms-omr
 * descarta questão em branco e dupla marcação igualmente, então os dois chegam
 * indistinguíveis. O rótulo diz o que se sabe.
 */
export type ResultadoDaQuestao = "acerto" | "erro" | "sem_leitura";

export interface RespostaDoEstudante {
  numero: number | null;
  questaoId: string;
  /** AUSENTE quando não houve leitura — não vazio, não nulo. */
  alternativaEstudante?: string;
  alternativaCorreta?: string;
  /**
   * ⚠️ Classificado pelo ms, não aqui: a regra de "sem leitura" é a ausência
   * da chave, e duas implementações dela divergiriam.
   */
  resultado: ResultadoDaQuestao;
}

export interface DetalheDoEstudante {
  status: StatusDoCartao;
  falha?: FalhaHistorico;
  respostas: RespostaDoEstudante[];
}
