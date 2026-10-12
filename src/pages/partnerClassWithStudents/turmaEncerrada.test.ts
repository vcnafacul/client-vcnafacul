import { describe, expect, it } from "vitest";
import { turmaEncerrada } from "./turmaEncerrada";

const dia = (d: string) => new Date(`${d}T12:00:00`);

describe("turmaEncerrada", () => {
  it("antes e no dia do término, ainda não", () => {
    expect(turmaEncerrada(dia("2026-12-12"), dia("2026-11-01"))).toBe(false);
    expect(turmaEncerrada(dia("2026-12-12"), dia("2026-12-12"))).toBe(false);
  });

  it("do dia seguinte em diante, sim", () => {
    expect(turmaEncerrada(dia("2025-12-12"), dia("2025-12-13"))).toBe(true);
    expect(turmaEncerrada(dia("2025-12-12"), dia("2026-10-12"))).toBe(true);
  });

  it("sem data (ou inválida), não avisa", () => {
    expect(turmaEncerrada(undefined)).toBe(false);
    expect(turmaEncerrada(null)).toBe(false);
    expect(turmaEncerrada("não é data")).toBe(false);
  });
});
