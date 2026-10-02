import { act, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/auth";

const push = vi.hoisted(() => ({
  syncPushToken: vi.fn(),
  mostrarEmPrimeiroPlano: vi.fn(),
  listenForeground: vi.fn((_cb: (m: Record<string, string>) => void) =>
    Promise.resolve(() => undefined),
  ),
}));
vi.mock("@/services/push/push", () => push);
const toast = vi.hoisted(() => ({ info: vi.fn() }));
vi.mock("react-toastify", () => ({ toast }));
const central = vi.hoisted(() => ({
  carregar: vi.fn(async () => undefined),
  carregarSeVelha: vi.fn(async () => undefined),
}));
vi.mock("@/store/notificacoes", () => ({
  useCentralStore: { getState: () => central },
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
    const { syncPushToken } = push;
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
    const { syncPushToken } = push;
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

describe("PushSync — mensagem com o app aberto", () => {
  const chegar = async (m: Record<string, string>) => {
    await waitFor(() => expect(push.listenForeground).toHaveBeenCalled());
    const cb = push.listenForeground.mock.calls.at(-1)![0];
    await act(async () => {
      cb(m);
    });
  };

  it("⚠️ Android/computador: nem barra nem toast — só o sino", async () => {
    push.mostrarEmPrimeiroPlano.mockResolvedValue(undefined);
    montar(jwt("u1"));
    await chegar({ title: "Oi", body: "Teste" });
    expect(push.mostrarEmPrimeiroPlano).not.toHaveBeenCalled();
    expect(toast.info).not.toHaveBeenCalled();
  });

  it("⚠️ iPhone: vai para a barra (o iOS corta quem recebe push sem mostrar)", async () => {
    const agente = vi
      .spyOn(navigator, "userAgent", "get")
      .mockReturnValue(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15",
      );
    push.mostrarEmPrimeiroPlano.mockRejectedValue(new TypeError("x"));
    try {
      montar(jwt("u1"));
      await chegar({ title: "Oi", body: "Teste" });
      expect(push.mostrarEmPrimeiroPlano).toHaveBeenCalledWith({
        title: "Oi",
        body: "Teste",
      });
      // recusou: sem toast mesmo assim
      expect(toast.info).not.toHaveBeenCalled();
    } finally {
      agente.mockRestore();
    }
  });
});

describe("PushSync — central de notificações (card 04)", () => {
  it("push com o app aberto → recarrega a central", async () => {
    push.mostrarEmPrimeiroPlano.mockResolvedValue(undefined);
    montar(jwt("u1"));
    await waitFor(() => expect(push.listenForeground).toHaveBeenCalled());
    const cb = push.listenForeground.mock.calls.at(-1)![0];
    await act(async () => {
      cb({ title: "Oi" });
    });
    expect(central.carregar).toHaveBeenCalledWith(jwt("u1"));
  });

  it("voltar para o app → recarrega se estiver velha (no máx. a cada 30s)", () => {
    montar(jwt("u1"));
    const visivel = vi
      .spyOn(document, "visibilityState", "get")
      .mockReturnValue("visible");
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(central.carregarSeVelha).toHaveBeenCalledWith(jwt("u1"));
    visivel.mockRestore();
  });

  it("⚠️ aviso do SW (push em segundo plano / clique) → recarrega; outra mensagem não", () => {
    const sw = new EventTarget();
    vi.stubGlobal("navigator", { ...navigator, serviceWorker: sw });
    try {
      montar(jwt("u1"));
      act(() => {
        sw.dispatchEvent(
          new MessageEvent("message", { data: { tipo: "outra" } }),
        );
      });
      expect(central.carregar).not.toHaveBeenCalled();
      act(() => {
        sw.dispatchEvent(
          new MessageEvent("message", { data: { tipo: "central:atualizar" } }),
        );
      });
      expect(central.carregar).toHaveBeenCalledWith(jwt("u1"));
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
