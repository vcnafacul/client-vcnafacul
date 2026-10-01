import { describe, expect, it } from "vitest";
import { formatMessageTimestamp } from "./formatMessageTimestamp";

const now = new Date(2026, 9, 1, 0, 30); // 01/10/2026 00:30

describe("formatMessageTimestamp", () => {
  it("mostra 'Hoje' para mensagens do mesmo dia", () => {
    expect(formatMessageTimestamp(new Date(2026, 9, 1, 0, 5), now)).toBe(
      "Hoje 00:05",
    );
  });

  it("mostra 'Ontem' logo antes da meia-noite", () => {
    expect(formatMessageTimestamp(new Date(2026, 8, 30, 23, 59), now)).toBe(
      "Ontem 23:59",
    );
  });

  it("mostra a data completa a partir de anteontem", () => {
    expect(formatMessageTimestamp(new Date(2026, 8, 29, 17, 39), now)).toBe(
      "29/09/2026 17:39",
    );
  });

  it("mostra o ano para mensagens de anos anteriores", () => {
    expect(formatMessageTimestamp(new Date(2025, 11, 31, 9, 0), now)).toBe(
      "31/12/2025 09:00",
    );
  });
});
