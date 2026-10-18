import { describe, expect, it, vi } from "vitest";
import {
  ajustarCascata,
  FILTROS_VAZIOS,
  opcoesDoFiltro,
  ProvaDoFiltro,
  resumoDasRevisoes,
  temFiltroAtivo,
} from "./filtrosDoBanco";

/** tickets/043, card 03. */
const ENEM = { _id: "enem", nome: "ENEM" };
const FUVEST = { _id: "fuvest", nome: "Fuvest" };
const provas: ProvaDoFiltro[] = [
  { _id: "p1", nome: "Enem D1 2022", categoria: { _id: "c1", nome: "Enem Dia 1", dono: "system", exame: ENEM } },
  { _id: "p2", nome: "Enem D2 2022", categoria: { _id: "c2", nome: "Enem Dia 2", dono: "system", exame: ENEM } },
  { _id: "p3", nome: "Enem D1 2023", categoria: { _id: "c1", nome: "Enem Dia 1", dono: "system", exame: ENEM } },
  { _id: "p4", nome: "Fuvest 2023", categoria: { _id: "c3", nome: "1ª fase", dono: "6acc0000000000000000cafe", exame: FUVEST } },
  { _id: "p6", nome: "Enem D1 do cursinho", categoria: { _id: "c5", nome: "Enem Dia 1", dono: "Cursinho", exame: ENEM } },
  // Categoria não populada (api antiga): entra só na lista de provas.
  { _id: "p5", nome: "Avulsa", categoria: "c9" },
];
const nomes = (xs: { nome: string }[]) => xs.map((x) => x.nome);

describe("filtro do banco — Exame → Categoria → Prova (043/03)", () => {
  it("sem nada: todos os exames, categorias com o dono (system/cursinho) no rótulo, todas as provas", () => {
    const o = opcoesDoFiltro(provas, { exame: "", categoria: "" });
    expect(nomes(o.exames)).toEqual(["ENEM", "Fuvest"]);
    // Categoria de um cursinho específico (dono = id) fica só com o nome.
    expect(nomes(o.categorias)).toEqual([
      "1ª fase",
      "Enem Dia 1 (cursinho)",
      "Enem Dia 1 (system)",
      "Enem Dia 2 (system)",
    ]);
    expect(o.provas).toHaveLength(6);
  });

  it("exame filtra categoria e prova; categoria filtra prova", () => {
    const o = opcoesDoFiltro(provas, { exame: "enem", categoria: "" });
    expect(nomes(o.categorias)).toEqual(["Enem Dia 1 (cursinho)", "Enem Dia 1 (system)", "Enem Dia 2 (system)"]);
    expect(nomes(o.provas)).toEqual(["Enem D1 2022", "Enem D1 2023", "Enem D1 do cursinho", "Enem D2 2022"]);
    const c = opcoesDoFiltro(provas, { exame: "enem", categoria: "c1" });
    expect(nomes(c.provas)).toEqual(["Enem D1 2022", "Enem D1 2023"]);
    const soCategoria = opcoesDoFiltro(provas, { exame: "", categoria: "c3" });
    expect(nomes(soCategoria.provas)).toEqual(["Fuvest 2023"]);
  });

  it("trocar o exame limpa a categoria e a prova que não casam (e Área/Matéria/Frente com a prova)", () => {
    const antes = {
      ...FILTROS_VAZIOS,
      exame: "fuvest",
      categoria: "c1",
      prova: "p1",
      enemArea: "Matemática",
      materia: "m",
      frente: "f",
    };
    expect(ajustarCascata(antes, provas)).toMatchObject({
      exame: "fuvest",
      categoria: "",
      prova: "",
      enemArea: "",
      materia: "",
      frente: "",
    });
  });

  it("o que ainda casa fica", () => {
    const f = { ...FILTROS_VAZIOS, exame: "enem", categoria: "c1", prova: "p3", materia: "m" };
    expect(ajustarCascata(f, provas)).toEqual(f);
  });

  it("filtro ativo conta os campos novos", () => {
    expect(temFiltroAtivo(FILTROS_VAZIOS)).toBe(false);
    expect(temFiltroAtivo({ ...FILTROS_VAZIOS, revisoes: ["reported"] })).toBe(true);
    expect(temFiltroAtivo({ ...FILTROS_VAZIOS, semImagem: true })).toBe(true);
    expect(temFiltroAtivo({ ...FILTROS_VAZIOS, exame: "enem" })).toBe(true);
  });

  it("resumo das revisões no gatilho", () => {
    expect(resumoDasRevisoes([])).toBe("Nenhuma");
    expect(resumoDasRevisoes(["reported"])).toBe("Report");
    expect(resumoDasRevisoes(["reported", "textClassification"])).toBe("2 marcadas");
  });
});

describe("getAllQuestions — parâmetros novos (043/03)", () => {
  it("manda exame, categoria, revisões juntas e semImagem; nada vazio", async () => {
    vi.stubEnv("VITE_BASE_URL", "http://api");
    vi.resetModules();
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ data: [], totalItems: 0 }), { status: 200 }),
    );
    vi.doMock("@/utils/fetchWrapper", () => ({ default: fetchMock }));
    const { getAllQuestions } = await import("@/services/question/getAllQuestion");
    await getAllQuestions("t", {
      ...FILTROS_VAZIOS,
      exame: "enem",
      categoria: "c1",
      revisoes: ["textClassification", "reported"],
      semImagem: true,
    });
    await getAllQuestions("t", FILTROS_VAZIOS);
    const [com, sem] = fetchMock.mock.calls.map((c) => new URL((c as unknown as [string])[0]));
    expect(com.searchParams.get("exame")).toBe("enem");
    expect(com.searchParams.get("categoria")).toBe("c1");
    expect(com.searchParams.get("revisoes")).toBe("textClassification,reported");
    expect(com.searchParams.get("semImagem")).toBe("true");
    expect([...sem.searchParams.keys()].sort()).toEqual(["limit", "page"]);
    vi.doUnmock("@/utils/fetchWrapper");
    vi.unstubAllEnvs();
  });
});
