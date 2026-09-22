import { describe, expect, it } from "vitest";
import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { CORES_DA_BARRA, segmentosDaBarra } from "./segmentosDaBarra";

const questao = (over: Partial<QuestaoDoRelatorio> = {}): QuestaoDoRelatorio => ({
  numero: 34,
  questaoId: "q34",
  // ⚠️ Coerente com a invariante da api: `sum(porAlternativa) + semLeitura ===
  // respondentes` (25 + 2 = 27), e `porAlternativa[correta] === acertos` (C=6).
  // Um fixture que a viola faz os testes de soma afirmarem o que a api nunca
  // produz — foi o que aconteceu na primeira versão deste arquivo.
  respondentes: 27,
  acertos: 6,
  erros: 19,
  semLeitura: 2,
  porAlternativa: { A: 2, B: 16, C: 6, D: 1, E: 0 },
  alternativaCorreta: "C",
  ...over,
});

describe("segmentosDaBarra", () => {
  it("⚠️ os seis segmentos somam 100% — e é a primeira vez que fecha na tela", () => {
    // Hoje as cinco colunas de alternativa somam MENOS de 100%, porque
    // `semLeitura` não entra em `porAlternativa`, e a explicação disso vive num
    // comentário no código em vez da interface. O sexto segmento torna a conta
    // visível.
    const soma = segmentosDaBarra(questao()).reduce((s, x) => s + x.fracao, 0);

    expect(soma).toBeCloseTo(1);
  });

  it("a largura de cada segmento é a fração sobre RESPONDENTES", () => {
    const segs = segmentosDaBarra(questao());

    // 16 de 27
    expect(segs.find((s) => s.rotulo === "B")!.fracao).toBeCloseTo(16 / 27);
    // 2 de 27 sem leitura
    expect(segs.find((s) => s.rotulo === "·")!.fracao).toBeCloseTo(2 / 27);
  });

  it("⚠️ a ordem é fixa A–E, e não por tamanho", () => {
    // Ordenar por tamanho deixaria cada linha com uma ordem diferente, e o
    // objetivo declarado desta coluna é ser lida de CIMA A BAIXO para achar o
    // distrator que pegou a turma. Ordem instável derrota isso.
    expect(segmentosDaBarra(questao()).map((s) => s.rotulo)).toEqual([
      "A",
      "B",
      "C",
      "D",
      "E",
      "·",
    ]);
  });

  it("marca qual segmento é o gabarito", () => {
    const segs = segmentosDaBarra(questao({ alternativaCorreta: "B" }));

    expect(segs.find((s) => s.rotulo === "B")!.gabarito).toBe(true);
    expect(segs.filter((s) => s.gabarito)).toHaveLength(1);
  });

  it("⚠️ gabarito `null` não marca segmento nenhum", () => {
    const segs = segmentosDaBarra(questao({ alternativaCorreta: null }));

    expect(segs.filter((s) => s.gabarito)).toHaveLength(0);
  });

  it("⚠️ sem respondentes devolve lista vazia, não seis zeros", () => {
    // Seis segmentos de 0% desenhariam uma barra vazia que se lê como
    // "ninguém marcou nada" — e o que houve é que não há base para dividir.
    expect(
      segmentosDaBarra(
        questao({ respondentes: 0, porAlternativa: {}, semLeitura: 0 }),
      ),
    ).toEqual([]);
  });

  it("⚠️ alternativa fora de A–E não some da conta sem aviso", () => {
    // O docblock do `porAlternativa` documenta o caso latente: um
    // `alternativaEstudante` fora de A–E conta como erro mas não entra em
    // nenhuma chave. Aqui a soma deixaria de fechar 100% — e é a barra que
    // torna isso visível, em vez de esconder.
    const segs = segmentosDaBarra(
      questao({ porAlternativa: { A: 2, B: 16, C: 6, D: 1 } }),
    );
    const soma = segs.reduce((s, x) => s + x.fracao, 0);

    expect(soma).toBeLessThan(1);
  });
});

describe("CORES_DA_BARRA", () => {
  it("⚠️ CATRACA: nenhuma cor fora do tailwind.config.js", () => {
    // O `tokens.test.ts` do dashV2 tem esta catraca, mas o docblock dele avisa
    // que ela só enxerga o `tokens.ts` — "uma classe de cor num .tsx passa
    // despercebida". Esta barra vive em `pages/` de propósito (o card 19 pede),
    // então ela traz a própria catraca.
    const paleta = new Set([
      "green3",
      "gray2",
      "lightGray",
      "marine",
      "white",
      "grey",
      "darkGrey",
    ]);

    for (const classe of Object.values(CORES_DA_BARRA)) {
      for (const cor of classe.match(/(?:bg|text|ring)-([a-zA-Z0-9]+)/g) ?? []) {
        expect(paleta).toContain(cor.replace(/^(bg|text|ring)-/, ""));
      }
    }
  });
});
