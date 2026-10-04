import { describe, expect, it } from "vitest";
import type { SectionForm } from "@/types/partnerPrepForm/sectionForm";
import { AnswerType } from "@/types/partnerPrepForm/questionForm";
import { respostasIniciais } from "./respostasIniciais";

const secao = {
  questions: [
    { _id: "deficiencia", answerType: AnswerType.Boolean },
    { _id: "nome", answerType: AnswerType.Text },
  ],
} as unknown as SectionForm;

describe("respostasIniciais (tickets-documentacao, 29)", () => {
  it("⚠️ Sim/Não começa sem resposta (antes vinha 'Não')", () => {
    expect(respostasIniciais(secao, {})).toEqual({});
  });

  it("volta com o que a pessoa já tinha respondido", () => {
    expect(respostasIniciais(secao, { deficiencia: true, outra: "x" })).toEqual({
      deficiencia: true,
    });
  });
});
