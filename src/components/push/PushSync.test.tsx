import { act, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/auth";

vi.mock("@/services/push/push", () => ({
  syncPushToken: vi.fn(),
  listenForeground: vi.fn(() => Promise.resolve(() => undefined)),
}));
const saida = vi.hoisted(() => ({
  aoSair: vi.fn(),
  desativarAoSair: vi.fn(),
  temDesativacaoPendente: vi.fn(() => false),
}));
vi.mock("@/services/push/aoSair", () => saida);

import { PushSync } from "./PushSync";

// JWT só com o payload que o PushSync lê (user.id); assinatura irrelevante.
const jwt = (id: string) => `x.${btoa(JSON.stringify({ user: { id } }))}.y`;

const logar = (token: string) =>
  act(() => useAuthStore.setState((s) => ({ data: { ...s.data, token } })));

function montar(tokenInicial = "") {
  useAuthStore.setState((s) => ({ data: { ...s.data, token: tokenInicial } }));
  return render(
    <MemoryRouter>
      <PushSync />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  saida.temDesativacaoPendente.mockReturnValue(false);
});

describe("PushSync — logout (FE-05)", () => {
  it("⚠️ logout() do store (o que os 7 caminhos chamam) → desativa o push", () => {
    montar(jwt("u1"));

    act(() => useAuthStore.getState().logout());

    expect(saida.aoSair).toHaveBeenCalledTimes(1);
  });

  it("renovar a sessão (token → outro token) NÃO desativa", () => {
    montar(jwt("u1"));
    logar(jwt("u1") + "renovado");
    expect(saida.aoSair).not.toHaveBeenCalled();
  });

  it("⚠️ abrir o app já deslogado (ex.: deploy limpou o login) NÃO desativa", () => {
    montar("");
    expect(saida.aoSair).not.toHaveBeenCalled();
    expect(saida.desativarAoSair).not.toHaveBeenCalled();
  });

  it("deslogado, outra mudança no store (sem token antes) NÃO desativa", () => {
    montar("");
    act(() =>
      useAuthStore.setState((s) => ({ data: { ...s.data, profiles: ["x"] } })),
    );
    expect(saida.aoSair).not.toHaveBeenCalled();
  });

  it("marca pendente de um logout interrompido → termina na abertura", () => {
    saida.temDesativacaoPendente.mockReturnValue(true);
    montar("");
    expect(saida.desativarAoSair).toHaveBeenCalledTimes(1);
  });

  it("depois de desmontar, não observa mais", () => {
    const { unmount } = montar(jwt("u1"));
    unmount();
    act(() => useAuthStore.getState().logout());
    expect(saida.aoSair).not.toHaveBeenCalled();
  });
});

describe("PushSync — token", () => {
  it("logado: sincroniza ao abrir e de novo ao voltar para o app", async () => {
    const { syncPushToken } = await import("@/services/push/push");
    montar(jwt("u1"));
    expect(syncPushToken).toHaveBeenCalledWith(jwt("u1"), "u1");

    const visivel = vi
      .spyOn(document, "visibilityState", "get")
      .mockReturnValue("visible");
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(syncPushToken).toHaveBeenLastCalledWith(jwt("u1"), "u1", {
      aoVoltar: true,
    });
    visivel.mockRestore();
  });

  it("indo para o fundo não sincroniza", async () => {
    const { syncPushToken } = await import("@/services/push/push");
    montar(jwt("u1"));
    const oculto = vi
      .spyOn(document, "visibilityState", "get")
      .mockReturnValue("hidden");
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(syncPushToken).toHaveBeenCalledTimes(1);
    oculto.mockRestore();
  });
});
