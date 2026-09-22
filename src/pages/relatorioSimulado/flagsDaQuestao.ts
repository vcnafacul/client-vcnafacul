import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { percentualDaAlternativa, percentualDeAcerto } from "./percentuais";

/**
 * Limiares de item analysis.
 *
 * ⚠️ **Constantes nomeadas e exportadas, não literais no meio do `if`.** Eles
 * são convenção, não lei, e vão ser questionados — o teste tem de poder citá-los
 * em vez de repetir o número, senão mudar um limiar exige mudar dois lugares e
 * um deles será esquecido.
 */
export const LIMIARES = {
  /*
    ⚠️ **Os de percentual estão em 0–100, não em fração.** É a escala que
    `percentuais.ts` devolve — e ela devolve INTEIRO ARREDONDADO.

    Comparar contra o número arredondado é deliberado: é o mesmo que a tela
    mostra. Uma questão exibindo "25%" com o badge "Difícil" ao lado não tem
    explicação para quem lê, e consistência entre a flag e o número vale mais
    que precisão no limiar — que é convenção, não lei.
  */
  /**
   * Abaixo disto a questão não diz nada sobre o aluno.
   *
   * 0,20 é o piso usual da literatura. Acima de 0,30 a questão é considerada
   * boa; entre os dois, aceitável.
   */
  discriminacaoMinima: 0.2,
  /**
   * ⚠️ Com 5 alternativas, **20% é o chute**. Abaixo de 25% a turma não está
   * respondendo, está sorteando — e a média de acerto não mede conhecimento.
   */
  acertoMuitoDificil: 25,
  /** Acima disto não separa ninguém. Não é defeito, mas ocupa vaga na prova. */
  acertoMuitoFacil: 90,
  /**
   * Distrator escolhido por menos disto está morto: a questão tem 5
   * alternativas no papel e menos na prática.
   */
  distratorMorto: 5,
} as const;

export type FlagDaQuestao =
  | "gabarito_suspeito"
  | "nao_discrimina"
  | "muito_dificil"
  | "muito_facil"
  | "distrator_morto";

const ALTERNATIVAS = ["A", "B", "C", "D", "E"] as const;

/**
 * Os sinais de triagem de uma questão.
 *
 * Um simulado tem de 45 a 180 questões, e a aba entregava uma linha para cada
 * com dez números de peso visual igual e nenhuma indicação de por onde começar.
 * Ordenar ajuda, mas ordenar por uma coluna de cada vez **não cruza dificuldade
 * com discriminação** — e é nesse cruzamento que os casos interessantes moram.
 *
 * ⚠️ **As flags se ACUMULAM, e não se elege uma principal.** Uma questão pode
 * ser "muito difícil" **e** ter "gabarito suspeito" — e é justamente a
 * combinação que fecha o diagnóstico: difícil sozinha pede aula, difícil com
 * gabarito suspeito pede conferir o gabarito antes de qualquer outra coisa.
 *
 * ⚠️ **Nenhuma flag quando a base não permite.** `discriminacao === null` (o
 * backend se recusou a avaliar: menos de 10 com leitura, ou variância zero) não
 * vira "não discrimina" — vira ausência de flag. Afirmar "item fraco" a partir
 * de uma amostra que o servidor recusou é pior que não dizer nada.
 *
 * ⚠️ **Pura e fora do componente**, pelos dois motivos que `statusDaLinha.ts` e
 * `dificuldadeDaQuestao.ts` já registram: montar Radix no jsdom custa caro neste
 * projeto, e regra de classificação não precisa de DOM; e o
 * `react-refresh/only-export-components` reprova função exportada ao lado de
 * componente.
 *
 * ⚠️ O sinal de **leitura suspeita** fica de fora: o limiar dele é o card 12,
 * que ainda não existe. E ele não é sobre a questão, é sobre a foto — misturar
 * os dois numa coluna chamada "Sinais" da questão confundiria as duas coisas.
 */
export function flagsDaQuestao(q: QuestaoDoRelatorio): FlagDaQuestao[] {
  const flags: FlagDaQuestao[] = [];

  /*
    ⚠️ Ordem: primeiro o que manda parar tudo (gabarito), depois a qualidade do
    item, depois a dificuldade. É a ordem em que o coordenador age, e a coluna
    `Sinais` renderiza nesta ordem — o primeiro badge é o mais urgente.
  */
  /*
    ⚠️ **`!= null` cobre `undefined`, e hoje isso NÃO muda o comportamento** —
    dito assim porque a mutação que o troca por `!== null` sobrevive a todos os
    testes, e vale saber por quê antes de alguém "simplificar".

    O DTO declara `number | null`, mas na janela entre o deploy do client e o do
    ms o campo chega AUSENTE. Com `!== null` o `undefined` entra na guarda e cai
    nas comparações, onde `undefined < 0` e `undefined < 0,2` são ambos `false`:
    o resultado final é o mesmo, **por acidente da semântica de comparação com
    `undefined`**, não por decisão.

    Fica `!= null` porque é a intenção escrita — "só calculo se tem valor" —, e
    porque quem mexer nas comparações abaixo não deve precisar descobrir esse
    acidente para não quebrar nada. É defesa em profundidade declarada, não
    cobertura que os testes garantem.

    ⚠️ Em `explicacaoDaFlag` o mesmo `== null` NÃO é redundante: lá o
    `undefined.toFixed()` estoura de verdade, e há teste.
  */
  if (q.discriminacao != null) {
    if (q.discriminacao < 0) {
      flags.push("gabarito_suspeito");
    } else if (q.discriminacao < LIMIARES.discriminacaoMinima) {
      // ⚠️ `else if`: negativa JÁ é o caso mais grave de não discriminar, e as
      // duas flags juntas diriam a mesma coisa duas vezes com urgências
      // diferentes.
      flags.push("nao_discrimina");
    }
  }

  const acerto = percentualDeAcerto(q);
  // ⚠️ `null` quando não há respondentes — e aí não há dificuldade a afirmar.
  if (acerto !== null) {
    if (acerto < LIMIARES.acertoMuitoDificil) flags.push("muito_dificil");
    if (acerto > LIMIARES.acertoMuitoFacil) flags.push("muito_facil");
  }

  /*
    ⚠️ **Só as alternativas ERRADAS.** O gabarito com 4% de marcação não é um
    distrator morto — é uma questão que a turma errou, que é o que as outras
    flags já dizem. Confundir os dois faria toda questão difícil aparecer como
    problema de redação de alternativa.

    ⚠️ E só com gabarito conhecido: sem ele (`null`, card 03) não há como saber
    qual alternativa excluir da varredura, e chutar inverteria o sinal.
  */
  if (q.alternativaCorreta !== null && acerto !== null) {
    const temDistratorMorto = ALTERNATIVAS.filter(
      (alt) => alt !== q.alternativaCorreta,
    ).some((alt) => {
      const p = percentualDaAlternativa(q, alt);
      return p !== null && p < LIMIARES.distratorMorto;
    });
    if (temDistratorMorto) flags.push("distrator_morto");
  }

  return flags;
}

/**
 * Como cada sinal aparece na tela.
 *
 * ⚠️ **Rótulo textual sempre, e cor só como reforço.** Mesma regra do
 * `rotuloDoResultado` e a mesma medição do `tokens.ts`: nenhuma cor de acento
 * desta paleta carrega texto pequeno sobre branco, e "esta questão tem gabarito
 * suspeito" não pode depender de enxergar vermelho. Os emojis da tabela do card
 * eram para o documento, não para a interface.
 *
 * ⚠️ `tone` reusa o vocabulário do `StatusBadge` (`missing | running | neutral`)
 * em vez de inventar um: ele é burro de propósito, e quem traduz domínio em tom
 * é a tela. Não há tom "alerta" na paleta — `missing` é o que carrega o peso
 * visual de "pare e olhe".
 */
export const APRESENTACAO_DAS_FLAGS: Record<
  FlagDaQuestao,
  { rotulo: string; tone: "missing" | "running" | "neutral"; explicacao: string }
> = {
  gabarito_suspeito: {
    rotulo: "Gabarito?",
    tone: "missing",
    explicacao:
      "Os alunos que foram bem na prova erraram esta questão mais que os que foram mal. Confira o gabarito antes de qualquer outra coisa.",
  },
  nao_discrimina: {
    rotulo: "Não discrimina",
    tone: "running",
    explicacao:
      "Acertar esta questão não diz nada sobre o aluno — os que sabem e os que não sabem acertam na mesma proporção.",
  },
  muito_dificil: {
    rotulo: "Difícil",
    tone: "running",
    explicacao:
      "Menos de 25% acertaram. Com cinco alternativas, 20% é o chute — a turma não está respondendo, está sorteando.",
  },
  muito_facil: {
    rotulo: "Fácil",
    tone: "neutral",
    explicacao:
      "Mais de 90% acertaram. Não é defeito, mas a questão não separa ninguém e ocupa uma vaga na prova.",
  },
  distrator_morto: {
    rotulo: "Distrator",
    tone: "neutral",
    explicacao:
      "Alguma alternativa errada foi escolhida por menos de 5%. A questão tem cinco alternativas no papel e menos na prática.",
  },
};

/** O que o CSV escreve — ver o docblock da coluna `Sinais` em `exportar.ts`. */
export function rotulosDasFlags(q: QuestaoDoRelatorio): string {
  return flagsDaQuestao(q)
    .map((f) => APRESENTACAO_DAS_FLAGS[f].rotulo)
    .join("; ");
}

/** Quantas questões da lista têm algum sinal — o contador do filtro. */
export function quantasComSinal(questoes: QuestaoDoRelatorio[]): number {
  return questoes.filter((q) => flagsDaQuestao(q).length > 0).length;
}

/**
 * Quais alternativas ERRADAS quase ninguém marcou.
 *
 * ⚠️ Exportada para o `title` poder **nomeá-las**. "Alguma alternativa errada
 * foi marcada por menos de 5%" manda o professor procurar qual; "a D foi
 * marcada por 2%" diz o que reescrever. A informação já estava calculada — só
 * não estava sendo dita.
 */
export function distratoresMortos(q: QuestaoDoRelatorio): string[] {
  if (q.alternativaCorreta === null) return [];
  return ALTERNATIVAS.filter((alt) => alt !== q.alternativaCorreta).filter(
    (alt) => {
      const p = percentualDaAlternativa(q, alt);
      return p !== null && p < LIMIARES.distratorMorto;
    },
  );
}

/**
 * A explicação de uma flag, **com os números desta questão**.
 *
 * ⚠️ **Concreta, não genérica.** A versão anterior repetia o limiar ("menos de
 * 25% acertaram"), que é a regra — não o que aconteceu aqui. Quem lê o tooltip
 * está olhando uma linha específica e quer saber o que ELA tem: "22% acertaram
 * (o chute com 5 alternativas é 20%)" responde; "menos de 25%" faz conferir na
 * coluna ao lado.
 *
 * ⚠️ Cada uma termina com **o que fazer**. Um sinal que diz o que está errado e
 * não o que fazer transfere o trabalho inteiro para quem lê — e a triagem
 * existe justamente para poupar esse trabalho.
 */
export function explicacaoDaFlag(
  flag: FlagDaQuestao,
  q: QuestaoDoRelatorio,
): string {
  const acerto = percentualDeAcerto(q);
  // ⚠️ `== null` pega `undefined` do ms antigo — ver a guarda em `flagsDaQuestao`.
  const disc =
    q.discriminacao == null
      ? "—"
      : q.discriminacao.toFixed(2).replace(".", ",");

  switch (flag) {
    case "gabarito_suspeito":
      return (
        `Discriminação ${disc}: os alunos que foram bem na prova erraram esta ` +
        "questão MAIS que os que foram mal. É o sinal clássico de gabarito " +
        "trocado — confira o gabarito antes de qualquer outra coisa."
      );
    case "nao_discrimina":
      return (
        `Discriminação ${disc}, abaixo de 0,20: acertar esta questão não diz ` +
        "nada sobre o aluno — quem sabe e quem não sabe acertam na mesma " +
        "proporção. Item fraco, vale revisar o enunciado."
      );
    case "muito_dificil":
      return (
        `Só ${acerto}% acertaram, e com cinco alternativas o chute já daria ` +
        "20%. A turma não está respondendo, está sorteando: ou o conteúdo não " +
        "foi dado, ou o enunciado não está claro."
      );
    case "muito_facil":
      return (
        `${acerto}% acertaram. Não é defeito, mas a questão não separa ninguém ` +
        "— ela ocupa uma vaga na prova sem medir nada."
      );
    case "distrator_morto": {
      const mortos = distratoresMortos(q);
      /*
        ⚠️ "C, D e E", e não "C e D e E" — o `join(" e ")` produzia a segunda, e
        o primeiro teste que escrevi a ACEITOU, porque eu escrevi a expectativa
        com o mesmo erro. Teste que copia a implementação não verifica nada.

        ⚠️ À mão, e não `Intl.ListFormat`: ele resolveria em qualquer língua,
        mas não está no `lib` do TypeScript deste projeto (`Property
        'ListFormat' does not exist on type 'typeof Intl'`), e mexer no
        `tsconfig` por uma lista de no máximo quatro letras não se paga.
      */
      const lista =
        mortos.length <= 1
          ? mortos.join("")
          : `${mortos.slice(0, -1).join(", ")} e ${mortos[mortos.length - 1]}`;
      const quais =
        mortos.length === 1
          ? `A alternativa ${lista} foi marcada`
          : `As alternativas ${lista} foram marcadas`;
      return (
        `${quais} por menos de 5% da turma. Na prática esta questão tem ` +
        `${5 - mortos.length} alternativas, não 5 — vale reescrever ` +
        `${mortos.length === 1 ? "essa" : "essas"}.`
      );
    }
  }
}
