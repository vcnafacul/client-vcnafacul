import { describe, expect, it } from "vitest";
import { dataLocal, formatDate } from "./date";

describe("dataLocal / formatDate com data sem hora", () => {
  it("⚠️ 'YYYY-MM-DD' é o dia no calendário local (new Date() daria o dia anterior no Brasil)", () => {
    const d = dataLocal("2026-10-05");
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([
      2026, 9, 5, 0,
    ]);
    expect(formatDate("2026-10-05")).toBe("05/10/2026");
  });

  it("ISO com hora segue o new Date de sempre", () => {
    const iso = "2026-10-05T15:30:00.000Z";
    expect(dataLocal(iso).getTime()).toBe(new Date(iso).getTime());
  });

  it("vazio continua vazio", () => {
    expect(formatDate(undefined)).toBe("");
    expect(formatDate("")).toBe("");
  });
});
