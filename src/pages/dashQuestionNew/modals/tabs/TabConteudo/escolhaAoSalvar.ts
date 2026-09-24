/**
 * A escolha ao salvar uma questão já respondida (card 27).
 *
 * ⚠️ **A pergunta certa NÃO é sobre "versão".** *"Deseja criar uma nova
 * versão?"* é uma pergunta conceitual, e pergunta conceitual no momento do save
 * é clicada no automático — mesma classe de "Deseja sobrescrever? [Sim]".
 *
 * O que a pessoa precisa entender é a **consequência**, e ela é sobre a prova:
 *
 * | | as provas que usam a questão | a original |
 * |---|---|---|
 * | **Correção** | continuam com esta questão | muda para todo mundo, inclusive no relatório de quem já respondeu |
 * | **Nova versão** | **passam a usar a nova** | congela, e é o que o histórico antigo vê |
 * | **Duplicar** (botão à parte) | **não mudam** | segue viva e editável |
 */

export type EscolhaDeEdicao = "correcao" | "novaVersao";

/** Os campos que o modal compara — os mesmos que o `updateContent` escreve. */
export const CAMPOS_COMPARADOS = [
  { campo: "textoQuestao", rotulo: "enunciado" },
  { campo: "pergunta", rotulo: "pergunta" },
  { campo: "textoAlternativaA", rotulo: "alternativa A" },
  { campo: "textoAlternativaB", rotulo: "alternativa B" },
  { campo: "textoAlternativaC", rotulo: "alternativa C" },
  { campo: "textoAlternativaD", rotulo: "alternativa D" },
  { campo: "textoAlternativaE", rotulo: "alternativa E" },
  { campo: "alternativa", rotulo: "gabarito" },
] as const;

/**
 * Os rótulos dos campos que mudaram.
 *
 * ⚠️ **O modal mostra o que mudou, e não pergunta no vácuo.** A pergunta
 * abstrata vira concreta quando vem com a lista — e é ela que sustenta a
 * heurística abaixo.
 */
export function camposQueMudaram(
  antes: Record<string, unknown>,
  depois: Record<string, unknown>,
): string[] {
  return CAMPOS_COMPARADOS.filter(({ campo }) => {
    const a = antes[campo];
    const b = depois[campo];
    // ⚠️ `== null` cobre os dois vazios — mesma regra do card 24 no ms.
    if (a == null && b == null) return false;
    if (a === b) return false;
    return String(a ?? "") !== String(b ?? "");
  }).map(({ rotulo }) => rotulo);
}

/**
 * ⚠️ **Só o que NÃO muda significado**: espaços, quebras de linha e acentuação
 * de pontuação. Tudo o mais é conteúdo.
 *
 * Deliberadamente conservadora — ela escolhe o **default**, não a decisão, e
 * errar para "nova versão" custa uma questão a mais no banco; errar para
 * "correção" reescreve o enunciado de uma prova já aplicada.
 */
function normalizar(texto: string): string {
  return texto.replace(/\s+/g, " ").trim();
}

/**
 * O que o modal propõe como padrão.
 *
 * ⚠️ **Sem heurística, o default vira hábito** — e o hábito vai ser o botão da
 * esquerda, sempre. O sistema usa o que ele sabe (o diff); a pessoa decide o
 * que só ela sabe (o significado).
 *
 * ⚠️ **Gabarito e alternativas SEMPRE propõem nova versão**, mesmo com mudança
 * de espaçamento: trocar uma alternativa muda o que a questão mede, e trocar o
 * gabarito muda quem acertou.
 */
export function escolhaSugerida(
  antes: Record<string, unknown>,
  depois: Record<string, unknown>,
): EscolhaDeEdicao {
  for (const { campo } of CAMPOS_COMPARADOS) {
    const a = String(antes[campo] ?? "");
    const b = String(depois[campo] ?? "");
    if (a === b) continue;

    /*
      ⚠️ **O gabarito não tem "mudança cosmética": qualquer diferença aqui muda
      QUEM ACERTOU.** É o caso que o card 28 (recorreção) trata, e propor
      "correção" nele seria o pior default possível.

      ⚠️ **E a linha só vale num caso, dito aqui porque uma mutação a expôs:**
      para `"A"` virando `"C"` o `normalizar` abaixo já resolveria. O que ela
      cobre é `"A"` virando `" A "` — gabarito com espaço é lixo de dado, e
      tratá-lo como cosmético gravaria um gabarito que o ms pode ler diferente.
      Há teste.
    */
    if (campo === "alternativa") return "novaVersao";

    if (normalizar(a) !== normalizar(b)) return "novaVersao";
  }
  return "correcao";
}

/**
 * A frase da opção "nova versão", com os números REAIS.
 *
 * ⚠️ **"as 3 provas" precisa ser o número de verdade.** Uma questão está em 2,7
 * simulados em média (medido no card 22), e quem edita não faz a menor ideia
 * disso — é o dado que faz a escolha ser informada em vez de intuitiva.
 */
export function textoDaNovaVersao(provas: number): string {
  const alvo =
    provas === 1 ? "a prova que a usa passa" : `as ${provas} provas que a usam passam`;
  return `O conteúdo mudou de verdade. Esta questão congela — é o que quem já respondeu vai ver — e ${alvo} a usar a nova, que começa sem estatísticas.`;
}

/**
 * A frase da opção "correção", com a contagem de respostas real.
 *
 * ⚠️ Depois dos cards 21 e 22 o contador é confiável, e é ele que torna a opção
 * concreta: "as 10 respostas já registradas continuam valendo" diz o que se
 * está preservando.
 */
export function textoDaCorrecao(respostas: number): string {
  const base =
    respostas === 1
      ? "a resposta já registrada continua valendo"
      : `as ${respostas} respostas já registradas continuam valendo`;
  return `Erro de digitação, formatação. A questão continua a mesma, e ${base}.`;
}
