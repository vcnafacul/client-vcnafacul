import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const amb = vi.hoisted(() => ({
  userAgent: "Mozilla/5.0 (Linux; Android 14) Chrome/130",
  standalone: false,
}));
vi.mock("@/services/push/plataforma", async (orig) => {
  const real = await orig<typeof import("@/services/push/plataforma")>();
  return {
    ...real,
    ambienteAtual: () => ({ ...amb, maxTouchPoints: 5 }),
  };
});
vi.mock("@/components/push/BannerNotificacoes", () => ({
  BannerNotificacoes: () => <div>banner de notificações</div>,
}));

import { BannerDoTopo } from "./BannerDoApp";
import { __resetarInstalacao, useInstalacaoDoApp } from "@/pwa/instalacao";

const convite = (outcome: "accepted" | "dismissed") =>
  ({
    prompt: vi.fn().mockResolvedValue(undefined),
    userChoice: Promise.resolve({ outcome }),
  }) as never;

const limparCookie = () => {
  document.cookie = "app_banner_adiado=; max-age=0; path=/";
};

describe("Banner do topo em etapas (029 · 02)", () => {
  beforeEach(() => {
    __resetarInstalacao();
    limparCookie();
    amb.userAgent = "Mozilla/5.0 (Linux; Android 14) Chrome/130";
    amb.standalone = false;
  });

  it("celular com convite: o do app, e NÃO o de notificações", () => {
    useInstalacaoDoApp.setState({ evento: convite("accepted") });
    render(<BannerDoTopo />);
    expect(screen.getByRole("region", { name: "Instalar o app" })).toHaveTextContent(
      "O Você na Facul agora tem app!",
    );
    expect(screen.queryByText("banner de notificações")).toBeNull();
  });

  it.each([
    ["sem convite (já instalado ou sem suporte)", () => undefined],
    [
      "desktop",
      () => {
        amb.userAgent = "Mozilla/5.0 (Windows NT 10.0) Chrome/130";
        useInstalacaoDoApp.setState({ evento: convite("accepted") });
      },
    ],
    [
      "dentro do app (standalone)",
      () => {
        amb.standalone = true;
        useInstalacaoDoApp.setState({ evento: convite("accepted") });
      },
    ],
  ])("%s: o de notificações", (_n, preparar) => {
    preparar();
    render(<BannerDoTopo />);
    expect(screen.queryByRole("region", { name: "Instalar o app" })).toBeNull();
    expect(screen.getByText("banner de notificações")).toBeInTheDocument();
  });

  it("aceitou no prompt nativo: o do app sai e vem o de notificações", async () => {
    const e = convite("accepted");
    useInstalacaoDoApp.setState({ evento: e });
    render(<BannerDoTopo />);
    fireEvent.click(screen.getByRole("button", { name: "Instalar" }));
    await waitFor(() => expect(screen.getByText("banner de notificações")).toBeInTheDocument());
    expect((e as { prompt: () => void }).prompt).toHaveBeenCalledTimes(1);
  });

  it("recusou no prompt nativo: adia 30 dias", async () => {
    useInstalacaoDoApp.setState({ evento: convite("dismissed") });
    render(<BannerDoTopo />);
    fireEvent.click(screen.getByRole("button", { name: "Instalar" }));
    await waitFor(() => expect(document.cookie).toContain("app_banner_adiado=1"));
  });

  it("⚠️ 'Agora não': some, fica adiado, e mesmo com convite novo não volta", () => {
    useInstalacaoDoApp.setState({ evento: convite("accepted") });
    const { unmount } = render(<BannerDoTopo />);
    fireEvent.click(screen.getByRole("button", { name: "Agora não" }));
    expect(screen.getByText("banner de notificações")).toBeInTheDocument();
    expect(document.cookie).toContain("app_banner_adiado=1");
    unmount();

    act(() => useInstalacaoDoApp.setState({ evento: convite("accepted") }));
    render(<BannerDoTopo />);
    expect(screen.queryByRole("region", { name: "Instalar o app" })).toBeNull();
  });
});
