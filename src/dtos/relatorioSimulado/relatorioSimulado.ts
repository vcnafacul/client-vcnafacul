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
   * Quantas questões o estudante acertou — o número absoluto.
   *
   * Cursinho conversa em acertos ("fiz 61 na primeira aplicação", "o corte de
   * Medicina ficou em 78"), e o percentual sozinho esconde o denominador: 58%
   * de 45 e 58% de 180 são confianças diferentes sobre o mesmo número.
   *
   * ⚠️ **Contado no ms, nunca derivado** de `aproveitamentoGeral × total`: a
   * fração arredondada produz 44 onde o aluno fez 45 — e ele confere à mão.
   *
   * ⚠️ **AUSENTE, não zero**, sem leitura concluída ou em histórico anterior
   * ao card 08. Zero acertos num cartão lido é ZERO, e é outra coisa.
   */
  acertos?: number;
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
  /**
   * Quantas questões do simulado tocam esta frente — o denominador do
   * `aproveitamento` (card 30).
   *
   * ⚠️ **Opcional, e ausente ≠ zero.** Histórico gravado antes daquele card não
   * tem a contagem, e ela é **irrecuperável**. A tela omite a base nesse caso;
   * "de 0 questões" seria uma afirmação falsa.
   */
  questoes?: number;
}

export interface MateriaDoEstudante {
  id: string;
  nome: string;
  aproveitamento: number;
  /**
   * Quantas questões do simulado tocam esta matéria.
   *
   * ⚠️ **As bases NÃO somam o total do simulado**, e isso é esperado desde o
   * card 14: uma questão conta inteira em cada (matéria, frente) que toca. Sem
   * esta contagem na tela, quem soma as matérias acha que a conta não fecha.
   *
   * ⚠️ **Não confundir com `MediaPorMateria.base`**, que conta ESTUDANTES na
   * média da turma. Aqui são questões.
   */
  questoes?: number;
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
  /**
   * Quantos estudantes do cursinho INTEIRO têm cartão neste simulado.
   *
   * ⚠️ **Só faz sentido no relatório de UMA turma** — "27 dos 30 cartões deste
   * simulado são desta turma". No relatório do cursinho inteiro ele é igual ao
   * numerador, e a frase não informaria nada.
   *
   * ⚠️ O campo atravessava os três serviços sem chegar à tela até o card 15.
   */
  totalEstudantesComCartaoNoCursinho: number;
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
  /**
   * Quantas questões o simulado tem — o denominador de `acertos`.
   *
   * ⚠️ **No resumo, não em cada linha**: é propriedade do simulado, não do
   * estudante. `0` quando o simulado sumiu, ou quando o ms ainda não tem o
   * card 08 — e aí a tela mostra só o percentual, nunca "61/0".
   */
  totalDeQuestoes: number;
  /**
   * O nome do simulado — sem ele a tela não se identifica (card 18).
   *
   * ⚠️ **`null` em DOIS casos que a tela precisa distinguir:** o simulado foi
   * apagado depois do vínculo (aí vale a constante `SEM_NOME`), ou o recorte
   * de turma está vazio e a api nem chegou a perguntar ao ms. `totalNoRecorte`
   * separa os dois — tratar o segundo como remoção faria a tela afirmar que o
   * simulado sumiu quando o que está vazio é a turma.
   */
  simuladoNome: string | null;
  /** O nome da turma quando o recorte é de uma. `null` no cursinho inteiro. */
  turmaNome: string | null;
  /**
   * Quando o cartão mais recente entrou no recorte, em ISO.
   *
   * ⚠️ **NÃO é "data da prova"** — ela não existe no modelo. E **não é "última
   * atividade"**: reenvio do mesmo estudante não move a data. O rótulo na tela
   * é "último cartão", e tem de continuar sendo.
   */
  ultimoCartaoEm: string | null;
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
  /**
   * Quantos acertaram esta questão na BASE INTEIRA — todos os cursinhos, todas
   * as aplicações, os dois fluxos (card 16).
   *
   * ⚠️ **Outro ESCOPO, não outro cálculo.** `acertos` é do recorte deste
   * relatório; este é global, e responde o que o recorte não pode: *"minha
   * turma foi mal nesta questão, ou a questão é difícil para todo mundo?"*.
   *
   * ⚠️ **Opcional**: chega `undefined` de uma api anterior ao card 16, e a
   * coluna some inteira — que é melhor que uma coluna de travessões.
   */
  acertosGeral?: number;
  /**
   * O denominador de `acertosGeral`.
   *
   * ⚠️ **Nunca mostre o percentual sem esta base ao lado.** "24%" sozinho não
   * diz se são 1.847 respostas ou 12, e as duas leituras são opostas:
   * dificuldade da questão contra ruído.
   */
  baseGeral?: number;
  /**
   * Esta questão é uma **versão** de outra (card 29).
   *
   * ⚠️ **A contagem global é DA QUESTÃO, não da linhagem** — e quem decidiu foi
   * o card 27: "correção" edita in-place e só "nova versão" cria uma entidade
   * nova, então toda versão nasce de uma mudança substantiva, e somar a família
   * somaria textos diferentes.
   *
   * ⚠️ **O custo é a base encolher a cada versão**, e a coluna ir sumindo pelo
   * piso de 30 sem ninguém saber por quê. Este campo existe para a tela poder
   * dizer *"a base é pequena porque a questão é nova"*.
   */
  ehVersao?: boolean;
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

/**
 * Um ponto da série de aplicações de um estudante (card 17).
 *
 * ⚠️ **A média do recorte vem JUNTO, e não é acessório.** Dois simulados de
 * dificuldade diferente não se comparam por percentual bruto: cair de 62% para
 * 55% pode ser MELHORA, se o segundo foi muito mais difícil. Com as duas linhas
 * no mesmo gráfico isso se lê sem normalizar nada — e a alternativa (z-score
 * contra a turma) é mais correta e ilegível para quem vai usar.
 *
 * ⚠️ **A linha do aluno sozinha é o gráfico que mais convida à conclusão
 * errada**, e é o padrão em quase toda plataforma de simulado.
 */
export interface PontoDaSerie {
  simuladoId: string;
  /** ⚠️ `null` quando o simulado foi apagado depois do vínculo. */
  nome: string | null;
  /** Fração de 0 a 1 — a tela é quem formata. */
  aproveitamento: number;
  /** ⚠️ Ausente em histórico anterior ao card 08. Nunca derive do percentual. */
  acertos?: number;
  /**
   * Quando o cartão entrou no recorte, em ISO.
   *
   * ⚠️ **NÃO é "data da prova"** — ela não existe no modelo. O rótulo na tela
   * tem de dizer o que é.
   */
  em: string;
  /**
   * A média do mesmo recorte naquele simulado.
   *
   * ⚠️ `null` quando ninguém mais tem leitura ali — nunca zero, que desenharia
   * a turma no chão e o aluno voando.
   */
  mediaDoRecorte: number | null;
  /**
   * Quantos entraram na média daquele ponto.
   *
   * ⚠️ Sem ela a linha da turma mente em silêncio: a média de 27 alunos e a de
   * 2 desenham o mesmo traço.
   */
  baseDoRecorte: number;
}

export interface SerieDoEstudante {
  pontos: PontoDaSerie[];
}
