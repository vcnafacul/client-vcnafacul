import { describe, expect, it } from "vitest";
import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { flagsDaQuestao, LIMIARES } from "./flagsDaQuestao";

/**
 * Base 20 e gabarito A, para os percentuais darem números redondos: cada
 * marcação vale 5 pontos percentuais.
 */
const questao = (over: Partial<QuestaoDoRelatorio> = {}): QuestaoDoRelatorio => ({
  numero: 1,
  questaoId: "q1",
  respondentes: 20,
  acertos: 10,
  erros: 10,
  semLeitura: 0,
  porAlternativa: { A: 10, B: 4, C: 3, D: 2, E: 1 },
  alternativaCorreta: "A",
  discriminacao: 0.4,
  ...over,
});

describe("flagsDaQuestao (card 06)", () => {
  it("questão boa não recebe sinal nenhum", () => {
    // 50% de acerto, discriminação 0,4, nenhum distrator abaixo de 5%.
    expect(flagsDaQuestao(questao({ porAlternativa: { A: 10, B: 4, C: 3, D: 2, E: 1 } }))).toEqual(
      [],
    );
  });

  describe("gabarito suspeito", () => {
    it("⚠️ discriminação negativa marca `gabarito_suspeito`", () => {
      // Os alunos que foram bem na prova erraram mais esta questão que os que
      // foram mal. É o achado mais acionável do relatório inteiro.
      expect(flagsDaQuestao(questao({ discriminacao: -0.1 }))).toContain(
        "gabarito_suspeito",
      );
    });

    it("⚠️ negativa NÃO acumula com `nao_discrimina`", () => {
      // Negativa já é o caso mais grave de não discriminar. As duas juntas
      // diriam a mesma coisa duas vezes, com urgências diferentes.
      const flags = flagsDaQuestao(questao({ discriminacao: -0.5 }));

      expect(flags).toContain("gabarito_suspeito");
      expect(flags).not.toContain("nao_discrimina");
    });

    it("discriminação exatamente 0 é `nao_discrimina`, não suspeita", () => {
      expect(flagsDaQuestao(questao({ discriminacao: 0 }))).toEqual([
        "nao_discrimina",
      ]);
    });
  });

  describe("não discrimina", () => {
    it(`abaixo de ${LIMIARES.discriminacaoMinima} marca`, () => {
      expect(flagsDaQuestao(questao({ discriminacao: 0.19 }))).toContain(
        "nao_discrimina",
      );
    });

    it(`⚠️ exatamente ${LIMIARES.discriminacaoMinima} NÃO marca — a borda é inclusiva`, () => {
      expect(
        flagsDaQuestao(questao({ discriminacao: LIMIARES.discriminacaoMinima })),
      ).not.toContain("nao_discrimina");
    });
  });

  describe("⚠️ base insuficiente não gera flag", () => {
    it("`discriminacao: null` não vira `nao_discrimina`", () => {
      // O backend se recusou a avaliar (menos de 10 com leitura, ou variância
      // zero). Afirmar "item fraco" a partir disso é pior que não dizer nada.
      const flags = flagsDaQuestao(questao({ discriminacao: null }));

      expect(flags).not.toContain("nao_discrimina");
      expect(flags).not.toContain("gabarito_suspeito");
    });

    it("questão sem respondentes não gera flag alguma", () => {
      expect(
        flagsDaQuestao(
          questao({
            respondentes: 0,
            acertos: 0,
            erros: 0,
            semLeitura: 0,
            porAlternativa: {},
            discriminacao: null,
          }),
        ),
      ).toEqual([]);
    });
  });

  describe("dificuldade", () => {
    it("⚠️ abaixo de 25% marca `muito_dificil` — 20% é o chute com 5 alternativas", () => {
      // 4 de 20 = 20%: a turma não está respondendo, está sorteando.
      expect(
        flagsDaQuestao(
          questao({ acertos: 4, erros: 16, porAlternativa: { A: 4, B: 8, C: 4, D: 3, E: 1 } }),
        ),
      ).toContain("muito_dificil");
    });

    it("⚠️ exatamente 25% NÃO marca — a borda é inclusiva", () => {
      // 5 de 20 = 25%.
      expect(
        flagsDaQuestao(
          questao({ acertos: 5, erros: 15, porAlternativa: { A: 5, B: 6, C: 4, D: 3, E: 2 } }),
        ),
      ).not.toContain("muito_dificil");
    });

    it("acima de 90% marca `muito_facil`", () => {
      // 19 de 20 = 95%.
      expect(
        flagsDaQuestao(
          questao({ acertos: 19, erros: 1, porAlternativa: { A: 19, B: 1, C: 0, D: 0, E: 0 } }),
        ),
      ).toContain("muito_facil");
    });

    it("⚠️ exatamente 90% NÃO marca — a borda é inclusiva", () => {
      // 18 de 20 = 90%.
      expect(
        flagsDaQuestao(
          questao({ acertos: 18, erros: 2, porAlternativa: { A: 18, B: 2, C: 0, D: 0, E: 0 } }),
        ),
      ).not.toContain("muito_facil");
    });
  });

  describe("distrator morto", () => {
    it("alternativa errada com menos de 5% marca", () => {
      // E com 0 marcação: 0% < 5%.
      expect(
        flagsDaQuestao(
          questao({ porAlternativa: { A: 10, B: 5, C: 5, D: 0, E: 0 } }),
        ),
      ).toContain("distrator_morto");
    });

    it("⚠️ exatamente 5% NÃO marca — a borda é inclusiva", () => {
      // 1 de 20 = 5%.
      expect(
        flagsDaQuestao(
          questao({ porAlternativa: { A: 10, B: 5, C: 3, D: 1, E: 1 } }),
        ),
      ).not.toContain("distrator_morto");
    });

    it("⚠️ o GABARITO com 4% não é distrator morto", () => {
      // É o critério de aceite explícito do card. Confundir os dois faria toda
      // questão difícil aparecer como problema de redação de alternativa — e o
      // coordenador reescreveria a alternativa certa.
      const flags = flagsDaQuestao(
        questao({
          acertos: 0,
          erros: 20,
          // gabarito A com 0%, e todas as erradas bem marcadas
          porAlternativa: { A: 0, B: 5, C: 5, D: 5, E: 5 },
        }),
      );

      expect(flags).not.toContain("distrator_morto");
      // mas segue muito difícil, que é o que de fato aconteceu
      expect(flags).toContain("muito_dificil");
    });

    it("⚠️ sem gabarito conhecido não marca — não há o que excluir da varredura", () => {
      // `alternativaCorreta: null` (card 03, históricos que discordam). Chutar
      // qual excluir inverteria o sinal.
      expect(
        flagsDaQuestao(
          questao({
            alternativaCorreta: null,
            porAlternativa: { A: 10, B: 10, C: 0, D: 0, E: 0 },
          }),
        ),
      ).not.toContain("distrator_morto");
    });
  });

  it("⚠️ as flags ACUMULAM — é a combinação que fecha o diagnóstico", () => {
    // Difícil sozinha pede aula; difícil COM gabarito suspeito pede conferir o
    // gabarito antes de qualquer outra coisa. Escolher uma "principal" perderia
    // exatamente a informação que decide a ação.
    const flags = flagsDaQuestao(
      questao({
        acertos: 3,
        erros: 17,
        discriminacao: -0.3,
        porAlternativa: { A: 3, B: 16, C: 1, D: 0, E: 0 },
      }),
    );

    expect(flags).toContain("gabarito_suspeito");
    expect(flags).toContain("muito_dificil");
    expect(flags).toContain("distrator_morto");
  });

  it("⚠️ a ordem é a da urgência: gabarito primeiro", () => {
    // A coluna renderiza nesta ordem, e o primeiro badge é o que o coordenador
    // deve olhar antes dos outros.
    const flags = flagsDaQuestao(
      questao({
        acertos: 3,
        erros: 17,
        discriminacao: -0.3,
        porAlternativa: { A: 3, B: 16, C: 1, D: 0, E: 0 },
      }),
    );

    expect(flags[0]).toBe("gabarito_suspeito");
  });
});
