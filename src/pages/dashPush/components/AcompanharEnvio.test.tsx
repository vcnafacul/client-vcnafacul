import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ buscarEnvio: vi.fn() }));
vi.mock("@/services/push/admin", () => api);

import { AcompanharEnvio, INTERVALO_MS } from "./AcompanharEnvio";

afterEach(() => vi.useRealTimers());

describe("AcompanharEnvio", () => {
  it("⚠️ sai de 'enviando' para 'concluído' sem recarregar (consulta a cada 2s)", async () => {
    vi.useFakeTimers();
    api.buscarEnvio
      .mockResolvedValueOnce({ status: "sending" })
      .mockResolvedValueOnce({ status: "sending" })
      .mockResolvedValue({ status: "done", successCount: 3, failureCount: 0 });

    render(<AcompanharEnvio id="e1" />);
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(screen.getByRole("status")).toHaveTextContent("Enviando");

    await act(() => vi.advanceTimersByTimeAsync(INTERVALO_MS * 2));

    expect(screen.getByRole("status")).toHaveTextContent(
      "3 entregues ao FCM · 0 falharam",
    );
    expect(api.buscarEnvio).toHaveBeenCalledTimes(3);
    expect(INTERVALO_MS).toBe(2000);
  });

  it("mostra o motivo de cada falha, em português", async () => {
    vi.useFakeTimers();
    api.buscarEnvio.mockReset().mockResolvedValue({
      status: "done",
      successCount: 0,
      failureCount: 2,
      failureReasons: {
        "messaging/registration-token-not-registered": 1,
        "messaging/algo-novo": 1,
      },
    });
    render(<AcompanharEnvio id="e1" />);
    await act(() => vi.advanceTimersByTimeAsync(0));

    expect(screen.getByRole("status")).toHaveTextContent("⚠️ 0 entregues");
    const motivos = screen.getByRole("list", { name: "Motivos das falhas" });
    expect(motivos).toHaveTextContent("o aparelho cancelou a inscrição");
    expect(motivos).toHaveTextContent("erro messaging/algo-novo");
  });

  it("para de consultar ao terminar", async () => {
    vi.useFakeTimers();
    api.buscarEnvio.mockReset().mockResolvedValue({ status: "failed" });
    render(<AcompanharEnvio id="e1" />);
    await act(() => vi.advanceTimersByTimeAsync(INTERVALO_MS * 3));
    expect(screen.getByRole("alert")).toHaveTextContent("O envio falhou");
    expect(api.buscarEnvio).toHaveBeenCalledTimes(1);
  });
});
