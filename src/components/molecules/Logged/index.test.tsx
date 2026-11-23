import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Os testes simulam o build de produção (tickets/029: o convite só existe lá).
vi.mock("@/pwa/conviteLigado", () => ({ conviteDeInstalacaoLigado: () => true }));

const amb = vi.hoisted(() => ({ standalone: false }));
vi.mock("@/services/push/plataforma", async (orig) => {
  const real = await orig<typeof import("@/services/push/plataforma")>();
  return {
    ...real,
    ambienteAtual: () => ({
      userAgent: "Mozilla/5.0 (Windows NT 10.0) Chrome/130",
      maxTouchPoints: 0,
      standalone: amb.standalone,
    }),
  };
});
vi.mock("../avatar", () => ({ default: () => <span>avatar</span> }));

// O menu do Radix usa ResizeObserver, que o jsdom não tem.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

import Logged from ".";
import { __resetarInstalacao, useInstalacaoDoApp } from "@/pwa/instalacao";
import { userNavigationLogged } from "@/pages/homeLegacy/data";

const abrirMenu = () => {
  render(
    <MemoryRouter>
      <Logged userName="Ana" userNavigation={userNavigationLogged} />
    </MemoryRouter>,
  );
  // O Radix abre o menu no pointerdown ou no teclado, não no click
  fireEvent.keyDown(screen.getByRole("button", { name: /Ana/ }), { key: "Enter" });
};

describe("'Instalar app' no menu do usuário (029 · 04)", () => {
  beforeEach(() => {
    __resetarInstalacao();
    amb.standalone = false;
  });

  it("sem convite do navegador: menu de sempre", () => {
    abrirMenu();
    expect(screen.queryByRole("menuitem", { name: "Instalar app" })).toBeNull();
    expect(screen.getByRole("menuitem", { name: "Sair" })).toBeInTheDocument();
  });

  it("itens de navegação são links de verdade", () => {
    abrirMenu();
    const perfil = screen.getByRole("menuitem", { name: "Meu Perfil" });
    expect(perfil.tagName).toBe("A");
    expect(perfil).toHaveAttribute("href");
  });

  it("com convite (também no desktop): 'Instalar app' antes de 'Sair', e abre o prompt nativo", async () => {
    const prompt = vi.fn().mockResolvedValue(undefined);
    useInstalacaoDoApp.setState({
      evento: { prompt, userChoice: Promise.resolve({ outcome: "accepted" }) } as never,
    });
    abrirMenu();
    const nomes = screen.getAllByRole("menuitem").map((i) => i.textContent);
    expect(nomes).toEqual(["Painel do Estudante", "Meu Perfil", "Instalar app", "Sair"]);

    await act(async () => {
      fireEvent.click(screen.getByRole("menuitem", { name: "Instalar app" }));
    });
    expect(prompt).toHaveBeenCalledTimes(1);
  });

  it("dentro do app (instalado): não aparece", () => {
    amb.standalone = true;
    useInstalacaoDoApp.setState({
      evento: { prompt: vi.fn(), userChoice: Promise.resolve({ outcome: "accepted" }) } as never,
    });
    abrirMenu();
    expect(screen.queryByRole("menuitem", { name: "Instalar app" })).toBeNull();
  });
});
