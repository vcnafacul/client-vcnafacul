import { describe, expect, it } from "vitest";
import type { SectionForm } from "@/types/partnerPrepForm/sectionForm";
import { secoesVisiveis } from "./secoesVisiveis";

const secao = (
  _id: string,
  active: boolean,
  questoes: [string, boolean][],
): SectionForm =>
  ({
    _id,
    name: _id,
    active,
    questions: questoes.map(([id, ativa]) => ({ _id: id, active: ativa })),
  }) as unknown as SectionForm;

describe("secoesVisiveis (tickets-documentacao, 17)", () => {
  const globais = [
    secao("g-ativa", true, [
      ["g1", true],
      ["g2", false],
    ]),
    secao("g-inativa", false, [["g3", true]]),
  ];
  const doCursinho = [
    secao("c-ativa", true, [
      ["c1", true],
      ["c2", false],
    ]),
    secao("c-inativa", false, [["c3", false]]),
  ];
  const r = secoesVisiveis(globais, doCursinho);

  it("⚠️ do cursinho: seções e questões inativas continuam aparecendo", () => {
    const meu = r.filter((s) => !s.isGlobal);
    expect(meu.map((s) => s._id)).toEqual(["c-ativa", "c-inativa"]);
    expect(meu[0].questions.map((q) => q._id)).toEqual(["c1", "c2"]);
    expect(meu[1].questions.map((q) => q._id)).toEqual(["c3"]);
  });

  it("globais: só as ativas, globais primeiro", () => {
    expect(r[0]).toMatchObject({ _id: "g-ativa", isGlobal: true });
    expect(r[0].questions.map((q) => q._id)).toEqual(["g1"]);
    expect(r.some((s) => s._id === "g-inativa")).toBe(false);
  });
});
