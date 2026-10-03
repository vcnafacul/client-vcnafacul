import { describe, expect, it } from "vitest";
import type { PeriodoDoIndicador } from "@/services/indicadores";
import {
  periodoInicial,
  rotuloDaAtualizacao,
  rotuloDoPeriodo,
} from "./periodo";

const p = (over: Partial<PeriodoDoIndicador> = {}): PeriodoDoIndicador => ({
  id: "p1",
  nome: "1º semestre",
  ano: 2026,
  inicio: "2026-02-01",
  fim: "2026-06-30",
  emAndamento: false,
  ...over,
});

describe("periodo dos indicadores", () => {
  it("abre no período em andamento; sem nenhum, no mais recente", () => {
    const lista = [p({ id: "a" }), p({ id: "b", emAndamento: true })];
    expect(periodoInicial(lista)?.id).toBe("b");
    expect(periodoInicial([p({ id: "a" }), p({ id: "c" })])?.id).toBe("a");
    expect(periodoInicial([])).toBeNull();
  });

  it("põe o ano no rótulo só quando o nome não tem", () => {
    expect(rotuloDoPeriodo(p())).toBe("2026 — 1º semestre");
    expect(rotuloDoPeriodo(p({ nome: "Período 2026" }))).toBe("Período 2026");
  });

  it("encerrado: 'Fechado em' com o dia do fim; aberto: hora da atualização", () => {
    expect(rotuloDaAtualizacao(p(), "2026-10-03T17:20:00Z")).toBe(
      "Fechado em 30/06/2026",
    );
    const agora = new Date(2026, 9, 3, 14, 5);
    expect(
      rotuloDaAtualizacao(p({ emAndamento: true }), agora.toISOString()),
    ).toBe("Atualizado às 14h05");
  });
});
