import { describe, expect, it } from "vitest";
import {
  camposQueMudaram,
  escolhaSugerida,
  textoDaCorrecao,
  textoDaNovaVersao,
} from "./escolhaAoSalvar";

const base = {
  textoQuestao: "Qual é a capital?",
  pergunta: "",
  textoAlternativaA: "a",
  textoAlternativaB: "b",
  textoAlternativaC: "c",
  textoAlternativaD: "d",
  textoAlternativaE: "e",
  alternativa: "A",
};

describe("camposQueMudaram", () => {
  it("lista os rótulos do que mudou", () => {
    expect(
      camposQueMudaram(base, { ...base, textoQuestao: "x", textoAlternativaC: "y" }),
    ).toEqual(["enunciado", "alternativa C"]);
  });

  it("nada mudou é lista vazia", () => {
    expect(camposQueMudaram(base, { ...base })).toEqual([]);
  });

  it("⚠️ `null` e `''` são o mesmo vazio", () => {
    // Mesma regra do card 24 no ms: questão legada sem `pergunta` recebendo
    // string vazia não é edição.
    expect(camposQueMudaram({ ...base, pergunta: null }, base)).toEqual([]);
  });
});

describe("escolhaSugerida", () => {
  it("⚠️ só espaçamento propõe CORREÇÃO", () => {
    expect(
      escolhaSugerida(base, { ...base, textoQuestao: "Qual  é   a capital? " }),
    ).toBe("correcao");
  });

  it("quebra de linha a mais também é correção", () => {
    expect(
      escolhaSugerida(base, { ...base, textoQuestao: "Qual é\na capital?" }),
    ).toBe("correcao");
  });

  it("texto diferente propõe NOVA VERSÃO", () => {
    expect(
      escolhaSugerida(base, { ...base, textoQuestao: "Qual é a moeda?" }),
    ).toBe("novaVersao");
  });

  it("⚠️ trocar ALTERNATIVA propõe nova versão", () => {
    // Muda o que a questão mede.
    expect(
      escolhaSugerida(base, { ...base, textoAlternativaC: "outra coisa" }),
    ).toBe("novaVersao");
  });

  it("⚠️ o GABARITO não tem mudança cosmética — sempre nova versão", () => {
    /*
      Qualquer diferença aqui muda QUEM ACERTOU. É o caso que o card 28
      (recorreção) trata, e propor "correção" nele seria o pior default
      possível.
    */
    expect(escolhaSugerida(base, { ...base, alternativa: "C" })).toBe(
      "novaVersao",
    );
  });

  it("⚠️ gabarito que muda só em ESPAÇO também propõe nova versão", () => {
    /*
      ⚠️ **Este teste nasceu de uma mutação que sobreviveu.** Para "A" → "C" o
      `normalizar` já resolveria; o que a guarda do gabarito cobre é "A" → " A ".
      Gabarito com espaço é lixo de dado, e tratá-lo como cosmético gravaria um
      valor que o ms pode ler diferente.
    */
    expect(escolhaSugerida(base, { ...base, alternativa: " A " })).toBe(
      "novaVersao",
    );
  });

  it("nada mudou propõe correção", () => {
    expect(escolhaSugerida(base, { ...base })).toBe("correcao");
  });

  it("⚠️ a heurística erra para o lado SEGURO", () => {
    /*
      Errar para "nova versão" custa uma questão a mais no banco; errar para
      "correção" reescreve o enunciado de uma prova já aplicada. Uma palavra
      trocada, que poderia ser argumentada como cosmética, propõe nova versão.
    */
    expect(
      escolhaSugerida(base, { ...base, textoQuestao: "Qual e a capital?" }),
    ).toBe("novaVersao");
  });
});

describe("textoDaNovaVersao", () => {
  it("⚠️ diz o número REAL de provas", () => {
    // Uma questão está em 2,7 simulados em média (card 22), e quem edita não
    // faz ideia disso — é o dado que faz a escolha ser informada.
    expect(textoDaNovaVersao(3)).toContain("as 3 provas que a usam passam");
  });

  it("uma prova fica no singular", () => {
    expect(textoDaNovaVersao(1)).toContain("a prova que a usa passa");
  });

  it("diz que a nova começa sem estatísticas", () => {
    expect(textoDaNovaVersao(2)).toContain("sem estatísticas");
  });
});

describe("textoDaCorrecao", () => {
  it("⚠️ diz quantas respostas continuam valendo", () => {
    expect(textoDaCorrecao(10)).toContain("as 10 respostas já registradas");
  });

  it("uma resposta fica no singular", () => {
    expect(textoDaCorrecao(1)).toContain("a resposta já registrada");
  });
});
