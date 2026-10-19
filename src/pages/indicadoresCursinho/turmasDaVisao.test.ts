import { describe, expect, it } from "vitest";
import {
  hojeEmSaoPaulo,
  rotuloDoPeriodoDaTurma,
  subtituloDoRecorte,
  turmasDaVisao,
} from "./turmasDaVisao";

const p = (id: string, inicio: string, fim: string) => ({
  periodoId: id,
  nome: id.toUpperCase(),
  inicio,
  fim,
  emAndamento: false,
  metricas: {},
});
const t = (id: string, periodoId: string) => ({
  id,
  nome: id,
  periodoId,
  periodoNome: periodoId.toUpperCase(),
  metricas: {},
});

const HOJE = "2026-10-18";
const p2025 = p("p2025", "2025-02-01", "2025-12-10");
const p2024 = p("p2024", "2024-02-01", "2024-12-10");
const p2026 = p("p2026", "2026-02-01", "2026-12-10");
const p2027 = p("p2027", "2027-02-01", "2027-12-10");

describe("turmasDaVisao (047)", () => {
  it("só os vigentes, com as encerradas escondidas", () => {
    const r = turmasDaVisao([t("a", "p2025"), t("b", "p2026")], [p2025, p2026], HOJE, false);
    expect(r.turmas.map((x) => x.id)).toEqual(["b"]);
    expect(r.recorte).toEqual({ tipo: "atuais" });
    expect(r.temEncerradasEscondidas).toBe(true);
  });

  it("D1: futuro antes do vigente", () => {
    const r = turmasDaVisao([t("b", "p2026"), t("c", "p2027")], [p2026, p2027], HOJE, false);
    expect(r.turmas.map((x) => [x.id, x.grupo])).toEqual([
      ["b", 1],
      ["c", 0],
    ]);
    expect(r.turmas.find((x) => x.id === "c")?.situacao).toBe("futuro");
  });

  it("D3: tudo vencido → só o último período, e o botão mostra o resto", () => {
    const r = turmasDaVisao(
      [t("x", "p2024"), t("a", "p2025"), t("a2", "p2025")],
      [p2024, p2025],
      HOJE,
      false,
    );
    expect(r.turmas.map((x) => x.id)).toEqual(["a", "a2"]);
    expect(r.recorte).toEqual({ tipo: "ultimo", periodo: "P2025" });
    expect(r.temEncerradasEscondidas).toBe(true);
  });

  it("com o botão: todas, e nada escondido", () => {
    const r = turmasDaVisao([t("a", "p2025"), t("b", "p2026")], [p2025, p2026], HOJE, true);
    expect(r.turmas.map((x) => x.id)).toEqual(["a", "b"]);
    expect(r.recorte).toEqual({ tipo: "todas" });
    expect(r.temEncerradasEscondidas).toBe(false);
  });

  it("período que termina hoje ainda é vigente; que começa amanhã é futuro", () => {
    const r = turmasDaVisao(
      [t("h", "ph"), t("f", "pf")],
      [p("ph", "2026-01-01", HOJE), p("pf", "2026-10-19", "2026-12-01")],
      HOJE,
      false,
    );
    expect(r.turmas.map((x) => [x.id, x.situacao])).toEqual([
      ["h", "vigente"],
      ["f", "futuro"],
    ]);
  });

  it("textos", () => {
    expect(subtituloDoRecorte({ tipo: "ultimo", periodo: "Extensivo 2025" })).toContain(
      "do último período (Extensivo 2025)",
    );
    expect(rotuloDoPeriodoDaTurma({ periodoNome: "Ext 2027", situacao: "futuro" }, "2027-02-01")).toBe(
      "Ext 2027 · começa em 01/02",
    );
    expect(rotuloDoPeriodoDaTurma({ periodoNome: "Ext 2025", situacao: "vencido" })).toBe(
      "Ext 2025 · encerrado",
    );
    expect(hojeEmSaoPaulo(new Date("2026-10-19T02:00:00Z"))).toBe("2026-10-18");
  });
});
