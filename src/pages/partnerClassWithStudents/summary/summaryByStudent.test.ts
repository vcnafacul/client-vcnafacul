import { describe, expect, it, vi } from "vitest";

vi.mock("@/utils/get-pdf", () => ({ downloadPDF: vi.fn() }));
vi.mock("@/utils/getBase64FromImageUrl", () => ({
  getBase64FromImageUrl: vi.fn(),
}));

import { nomeDoAluno } from "./summaryByStudent";

const aluno = (over: object) => ({
  name: "Maria",
  lastName: "Souza",
  socialName: "",
  useSocialName: false,
  codEnrolled: "1",
  totalClassRecords: 1,
  studentRecords: 1,
  presencePercentage: 100,
  ...over,
});

describe("nomeDoAluno no PDF por estudante (tickets-documentacao, 12)", () => {
  it("nome completo", () => {
    expect(nomeDoAluno(aluno({}))).toBe("Maria Souza");
  });

  it("nome social + sobrenome, quando a pessoa usa", () => {
    expect(
      nomeDoAluno(aluno({ useSocialName: true, socialName: "Mari" })),
    ).toBe("Mari Souza");
  });

  it("api antiga, sem sobrenome: só o nome, sem 'undefined'", () => {
    expect(nomeDoAluno(aluno({ lastName: undefined }))).toBe("Maria");
  });

  it("usa nome social mas ele está vazio: cai no nome", () => {
    expect(nomeDoAluno(aluno({ useSocialName: true }))).toBe("Maria Souza");
  });
});
