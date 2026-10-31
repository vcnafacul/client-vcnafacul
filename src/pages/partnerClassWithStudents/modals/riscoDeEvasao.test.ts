import { describe, expect, it } from "vitest";
import { justificadoNaData, riscoDeEvasao } from "./riscoDeEvasao";

const alerta = { percentual: 15, minimoDeAulas: 10 };
const ausente = { presente: false, justificado: false };
const presente = { presente: true, justificado: false };

describe("riscoDeEvasao (tickets/054, R2–R5)", () => {
  it("2 faltas em 11 aulas: Ausente hoje → 3/12 = 25%; Presente → 2/12 ≈ 17%", () => {
    const aluno = { aulas: 11, faltasNaoJustificadas: 2 };
    expect(riscoDeEvasao(aluno, ausente, alerta)).toEqual({
      percentual: 25,
      emRisco: true,
    });
    const r = riscoDeEvasao(aluno, presente, alerta);
    expect(Math.round(r.percentual)).toBe(17);
    expect(r.emRisco).toBe(true);
  });

  it("⚠️ abaixo do mínimo de aulas nunca está em risco, mesmo com 100%", () => {
    const aluno = { aulas: 8, faltasNaoJustificadas: 8 };
    expect(riscoDeEvasao(aluno, ausente, alerta)).toEqual({
      percentual: 100,
      emRisco: false,
    });
  });

  it("a aula de hoje conta para o mínimo: 9 + hoje = 10", () => {
    const aluno = { aulas: 9, faltasNaoJustificadas: 2 };
    expect(riscoDeEvasao(aluno, ausente, alerta).emRisco).toBe(true);
  });

  it("justificado na data: Ausente não soma falta, mas a aula conta", () => {
    const aluno = { aulas: 19, faltasNaoJustificadas: 3 };
    // 3/20 = 15% exato → entra (≥); justificado não vira 4/20.
    expect(
      riscoDeEvasao(aluno, { presente: false, justificado: true }, alerta),
    ).toEqual({ percentual: 15, emRisco: true });
    expect(riscoDeEvasao(aluno, presente, alerta)).toEqual({
      percentual: 15,
      emRisco: true,
    });
  });

  it("exatamente no limite entra; logo abaixo não", () => {
    expect(
      riscoDeEvasao({ aulas: 19, faltasNaoJustificadas: 2 }, ausente, alerta)
        .emRisco,
    ).toBe(true); // 3/20 = 15%
    expect(
      riscoDeEvasao({ aulas: 20, faltasNaoJustificadas: 2 }, ausente, alerta)
        .emRisco,
    ).toBe(false); // 3/21 ≈ 14,3%
  });

  it.each([
    // [aulas antes, faltas antes, alerta %] → hoje Ausente fica exatamente no %
    [49, 28, 58], // 29/50: em ponto flutuante dá 57,999…
    [99, 28, 29], // 29/100
    [99, 56, 57], // 57/100
  ])(
    "⚠️ exatamente no limite em ponto flutuante: %i aulas, %i faltas, alerta %i%%",
    (aulas, faltas, percentual) => {
      expect(
        riscoDeEvasao(
          { aulas, faltasNaoJustificadas: faltas },
          ausente,
          { percentual, minimoDeAulas: 10 },
        ).emRisco,
      ).toBe(true);
    },
  );

  it("sem alerta configurado → nunca em risco", () => {
    const aluno = { aulas: 30, faltasNaoJustificadas: 30 };
    expect(riscoDeEvasao(aluno, ausente, null).emRisco).toBe(false);
  });

  it("api antiga sem os campos: trata como aluno novo", () => {
    expect(riscoDeEvasao({}, ausente, alerta)).toEqual({
      percentual: 100,
      emRisco: false,
    });
  });
});

describe("justificadoNaData (R4)", () => {
  const aluno = {
    justificativasPorPeriodo: [{ inicio: "2026-10-20", fim: "2026-10-24" }],
  };
  it.each([
    ["2026-10-20", true],
    ["2026-10-22", true],
    ["2026-10-24", true],
    ["2026-10-19", false],
    ["2026-10-25", false],
  ])("%s → %s", (data, esperado) =>
    expect(justificadoNaData(aluno, data)).toBe(esperado),
  );
  it("sem intervalos → falso", () =>
    expect(justificadoNaData({}, "2026-10-22")).toBe(false));
});
