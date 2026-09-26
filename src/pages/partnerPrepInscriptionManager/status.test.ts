import { StatusEnum } from "@/enums/generic/statusEnum";
import { describe, expect, it } from "vitest";
import { statusDoProcesso } from "./status";

const agora = new Date("2026-09-26T12:00:00Z");

describe("statusDoProcesso (tickets/021 card 01)", () => {
  it("⚠️ encerrado pela data com endDate em STRING ISO — como a api manda", () => {
    // Antes: `"2026-..." < new Date()` → NaN → false → aparecia ativo
    const processo = {
      endDate: "2026-09-01T00:00:00.000Z" as unknown as Date,
      actived: StatusEnum.Approved,
    };
    expect(statusDoProcesso(processo, agora)).toBe(StatusEnum.Rejected);
  });

  it("encerrado pela data com endDate em Date", () => {
    const processo = {
      endDate: new Date("2026-09-01T00:00:00Z"),
      actived: StatusEnum.Approved,
    };
    expect(statusDoProcesso(processo, agora)).toBe(StatusEnum.Rejected);
  });

  it.each([
    [StatusEnum.Approved, "ativo"],
    [StatusEnum.Pending, "pendente"],
  ])("ainda aberto: o status gravado (%s, %s)", (actived) => {
    const processo = { endDate: new Date("2026-12-01T00:00:00Z"), actived };
    expect(statusDoProcesso(processo, agora)).toBe(actived);
  });
});
