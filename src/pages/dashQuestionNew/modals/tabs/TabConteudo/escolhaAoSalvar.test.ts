import { describe, expect, it } from "vitest";
import {
  camposQueMudaram,
  escolhaSugerida,
  textoDaCorrecao,
  textoDaNovaVersao,
  separarProvas,
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

/** n provas que recebem novas versões e m com versões fixas. */
const provas = (recebem: number, fixas = 0) => [
  ...Array.from({ length: recebem }, (_, i) => ({
    provaNome: `R${i}`,
    receberNovasVersoes: true,
  })),
  ...Array.from({ length: fixas }, (_, i) => ({
    provaNome: `F${i}`,
    receberNovasVersoes: false,
  })),
];

describe("textoDaNovaVersao", () => {
  it("⚠️ diz o número REAL de provas", () => {
    // Uma questão está em 2,7 simulados em média (card 22), e quem edita não
    // faz ideia disso — é o dado que faz a escolha ser informada.
    expect(textoDaNovaVersao(provas(3))).toContain("as 3 provas que a usam passam");
  });

  it("uma prova fica no singular", () => {
    expect(textoDaNovaVersao(provas(1))).toContain("a prova que a usa passa");
  });

  it("diz que a nova começa sem estatísticas", () => {
    expect(textoDaNovaVersao(provas(2))).toContain("sem estatísticas");
  });

  it("⚠️ 023 · 10 — misto: os dois grupos com os números reais", () => {
    const t = textoDaNovaVersao(provas(3, 2));
    expect(t).toContain("3 provas passam a usar a nova versão");
    expect(t).toContain("2 provas estão com versões fixas e continuam com esta");
  });

  it("⚠️ 023 · 18 — misto: NÃO diz que congela; diz que segue editável nas fixas", () => {
    const t = textoDaNovaVersao(provas(2, 1));
    expect(t).not.toContain("congela");
    expect(t).toContain("que segue valendo e editável nelas");
  });

  it("023 · 18 — todas recebem: congela, como antes", () => {
    expect(textoDaNovaVersao(provas(2))).toContain("Esta questão congela");
  });

  it("023 · 10 — misto no singular", () => {
    const t = textoDaNovaVersao(provas(1, 1));
    expect(t).toContain("1 prova passa a usar a nova versão");
    expect(t).toContain("1 prova está com versões fixas e continua com esta");
  });

  it("⚠️ 023 · 10 — todas travadas: nenhuma recebe agora", () => {
    const t = textoDaNovaVersao(provas(0, 2));
    expect(t).toContain(
      "Nenhuma prova recebe a nova versão agora — todas estão com versões fixas",
    );
    // 023 · 18: não congela — segue valendo, editável
    expect(t).toContain("continua valendo em todas, editável");
    expect(t).not.toContain("congela");
    expect(t).toContain("fica disponível para os donos aplicarem");
    expect(t).not.toMatch(/passa[m]? a usar/);
  });

  it("api antiga (sem o campo) = recebe, como antes", () => {
    expect(textoDaNovaVersao([{ provaNome: "P" }, { provaNome: "Q" }])).toContain(
      "as 2 provas que a usam passam",
    );
  });

  it("sem prova nenhuma: não fala em '0 provas'", () => {
    const t = textoDaNovaVersao([]);
    expect(t).not.toContain("0 provas");
    expect(t).toContain("sem prova");
  });
});

describe("separarProvas (023 · 10)", () => {
  it("separa pelos nomes", () => {
    expect(separarProvas(provas(1, 1))).toEqual({ recebem: ["R0"], mantem: ["F0"] });
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
