import { describe, expect, it } from "vitest";
import type { SectionForm } from "@/types/partnerPrepForm/sectionForm";
import { AnswerType } from "@/types/partnerPrepForm/questionForm";
import { Logic } from "@/types/partnerPrepForm/condition";
import { questoesDeReferencia } from "./questoesDeReferencia";
import { resumo, rotuloDaLogica, ROTULO_DO_TIPO } from "./textosDeCondicao";

const secao = (_id: string, ids: string[]) =>
  ({ _id, questions: ids.map((q) => ({ _id: q })) }) as unknown as SectionForm;

describe("questoesDeReferencia (tickets-documentacao, 27)", () => {
  const secoes = [secao("global", ["g1"]), secao("s2", ["a", "b"]), secao("s4", ["z"])];

  it("⚠️ só seções até a atual (globais contam como anteriores)", () => {
    expect(questoesDeReferencia(secoes, "s2").map((q) => q._id)).toEqual([
      "g1",
      "a",
      "b",
    ]);
  });

  it("seção desconhecida: todas", () => {
    expect(questoesDeReferencia(secoes, "x")).toHaveLength(4);
  });
});

describe("textos de condição (27)", () => {
  it("tipos e lógica em português; reticências só quando corta", () => {
    expect(ROTULO_DO_TIPO[AnswerType.Boolean]).toBe("Sim/Não");
    expect(rotuloDaLogica(Logic.And)).toBe("E (todas)");
    expect(rotuloDaLogica(Logic.Or)).toBe("OU (qualquer)");
    expect(resumo("Idade")).toBe("Idade");
    expect(resumo("x".repeat(60))).toBe(`${"x".repeat(50)}…`);
  });
});
