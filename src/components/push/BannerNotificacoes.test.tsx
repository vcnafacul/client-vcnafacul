import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PushStatus } from "@/services/push/push";
import { useAuthStore } from "@/store/auth";

const hook = vi.hoisted(() => ({
  status: "default" as PushStatus | null,
  ocupado: false,
  ativar: vi.fn(),
}));
vi.mock("@/hooks/usePushNotifications", () => ({
  usePushNotifications: () => hook,
}));
const toast = vi.hoisted(() => ({ error: vi.fn() }));
vi.mock("react-toastify", () => ({ toast }));

import { BannerNotificacoes } from "./BannerNotificacoes";

function montar({
  status = "default" as PushStatus,
  alcance = "todos",
  profiles = ["common"],
} = {}) {
  hook.status = status;
  vi.stubEnv("VITE_PUSH_BANNER", alcance);
  useAuthStore.setState((s) => ({ data: { ...s.data, profiles } }));
  return render(
    <MemoryRouter>
      <BannerNotificacoes />
    </MemoryRouter>,
  );
}
const banner = () =>
  screen.queryByRole("region", { name: /ativar notificações/i });

function limparCookies() {
  document.cookie.split("; ").forEach((c) => {
    const nome = c.split("=")[0];
    if (nome) document.cookie = `${nome}=; max-age=0; path=/`;
  });
}

beforeEach(() => {
  limparCookies();
  vi.clearAllMocks();
});
afterEach(() => vi.unstubAllEnvs());

describe("BannerNotificacoes", () => {
  it("rollout off (padrão) → não aparece", () => {
    const off = montar({ alcance: "off" });
    expect(banner()).toBeNull();
    off.unmount();
    montar({ alcance: "qualquer-coisa" });
    expect(banner()).toBeNull();
  });

  it("colaboradores: aparece para colaborador, não para aluno", () => {
    const aluno = montar({
      alcance: "colaboradores",
      profiles: ["common", "student"],
    });
    expect(banner()).toBeNull();
    aluno.unmount();
    montar({ alcance: "colaboradores", profiles: ["collaborator"] });
    expect(banner()).toBeInTheDocument();
  });

  it.each(["active", "denied", "unsupported", "disabled-by-flag"] as const)(
    "%s → não aparece",
    (status) => {
      montar({ status });
      expect(banner()).toBeNull();
    },
  );

  it("⚠️ não pede permissão sozinho; só no clique de Ativar", () => {
    montar({ status: "default" });
    expect(hook.ativar).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Ativar" }));
    expect(hook.ativar).toHaveBeenCalledTimes(1);
  });

  it("bloqueou no prompt → em vez de sumir, explica que está bloqueado e onde liberar", async () => {
    hook.ativar.mockResolvedValueOnce("denied");
    montar({ status: "default" });

    fireEvent.click(screen.getByRole("button", { name: "Ativar" }));

    const aviso = await screen.findByRole("region", {
      name: "Notificações bloqueadas",
    });
    expect(aviso).toHaveTextContent("não deixa o site perguntar de novo");
    expect(aviso).toHaveTextContent("Notificações");
    expect(
      screen.queryByRole("button", { name: "Ativar" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Entendi" }));
    expect(
      screen.queryByRole("region", { name: "Notificações bloqueadas" }),
    ).not.toBeInTheDocument();
  });

  it("falha ao registrar → toast de erro, sem erro solto", async () => {
    hook.ativar.mockRejectedValueOnce(new Error("api fora"));
    montar({ status: "default" });

    fireEvent.click(screen.getByRole("button", { name: "Ativar" }));

    await vi.waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
  });

  it("ios-needs-install: leva para Minha conta, onde está o passo a passo", () => {
    montar({ status: "ios-needs-install" });
    expect(screen.getByRole("link", { name: "Como fazer" })).toHaveAttribute(
      "href",
      "/dashboard/meu-perfil",
    );
  });

  it("⚠️ Agora não esconde, e continua escondido depois de um deploy (localStorage limpo)", () => {
    const { unmount } = montar();
    fireEvent.click(screen.getByRole("button", { name: "Agora não" }));
    expect(banner()).toBeNull();
    unmount();

    localStorage.clear(); // o que o main.tsx faz a cada deploy
    montar();
    expect(banner()).toBeNull();
  });
});
