import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  listarNotificacoes: vi.fn(),
  marcarNotificacaoLida: vi.fn(),
  marcarTodasLidas: vi.fn(),
}));
vi.mock("@/services/notificacoes", () => api);

import { INTERVALO_MINIMO_MS, useCentralStore } from "./notificacoes";

beforeEach(() => {
  vi.clearAllMocks();
  useCentralStore.getState().limpar();
  api.listarNotificacoes.mockResolvedValue({ data: [], naoLidas: 3 });
});

describe("useCentralStore", () => {
  it("carregarSeVelha: pula dentro de 30s, recarrega depois", async () => {
    const agora = vi.spyOn(Date, "now").mockReturnValue(1_000_000);
    await useCentralStore.getState().carregar("jwt");
    await useCentralStore.getState().carregarSeVelha("jwt");
    expect(api.listarNotificacoes).toHaveBeenCalledTimes(1);

    agora.mockReturnValue(1_000_000 + INTERVALO_MINIMO_MS);
    await useCentralStore.getState().carregarSeVelha("jwt");
    expect(api.listarNotificacoes).toHaveBeenCalledTimes(2);
    expect(useCentralStore.getState().naoLidas).toBe(3);
    agora.mockRestore();
  });

  it("limpar (logout) zera tudo", async () => {
    await useCentralStore.getState().carregar("jwt");
    useCentralStore.getState().limpar();
    expect(useCentralStore.getState()).toMatchObject({
      itens: [],
      naoLidas: 0,
      carregada: false,
      ultimaCarga: 0,
    });
  });
});
