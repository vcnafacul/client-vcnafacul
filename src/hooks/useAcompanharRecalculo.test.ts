import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  INTERVALO_MS,
  LIMITE_MS,
  mesAtual,
  useAcompanharRecalculo,
} from "./useAcompanharRecalculo";

const tick = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

describe("useAcompanharRecalculo (tickets-documentacao, 09 e 10)", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("para quando fica pronto", async () => {
    const consultar = vi
      .fn()
      .mockResolvedValueOnce({ n: 0 })
      .mockResolvedValueOnce({ n: 1 });
    const { result } = renderHook(() =>
      useAcompanharRecalculo({
        ativo: true,
        consultar,
        pronto: (r: { n: number }) => r.n > 0,
      }),
    );
    await tick(INTERVALO_MS);
    expect(result.current.resultado).toBeNull();
    await tick(INTERVALO_MS);
    expect(result.current.resultado).toEqual({ n: 1 });
    await tick(INTERVALO_MS * 3);
    expect(consultar).toHaveBeenCalledTimes(2);
  });

  it("⚠️ esgota em 90 s mesmo com toda consulta falhando", async () => {
    const consultar = vi.fn().mockRejectedValue(new Error("rede"));
    const { result } = renderHook(() =>
      useAcompanharRecalculo({ ativo: true, consultar, pronto: () => true }),
    );
    await tick(LIMITE_MS - INTERVALO_MS);
    expect(result.current.esgotou).toBe(false);
    await tick(INTERVALO_MS);
    expect(result.current.esgotou).toBe(true);
    expect(result.current.resultado).toBeNull();
  });

  it("inativo não consulta", async () => {
    const consultar = vi.fn();
    renderHook(() =>
      useAcompanharRecalculo({ ativo: false, consultar, pronto: () => true }),
    );
    await tick(LIMITE_MS);
    expect(consultar).not.toHaveBeenCalled();
  });

  it("mês atual em UTC, como a api", () => {
    expect(mesAtual(new Date("2026-05-31T23:30:00Z"))).toBe("2026-05");
    expect(mesAtual(new Date("2026-06-01T00:30:00Z"))).toBe("2026-06");
  });
});
