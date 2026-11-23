import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashTemplate from ".";

// O menu real busca matérias na api; aqui só importa o estado da gaveta.
vi.mock("@/components/organisms/sidebarDash", () => ({
  SidebarDash: () => {
    const { openMobile } = useSidebar();
    return (
      <>
        <div data-testid="menu-lateral" data-aberto={openMobile} />
        <Sidebar>
          <a href="/dashboard">Item do menu</a>
        </Sidebar>
      </>
    );
  },
}));

// Abaixo de 1565px: a sidebar vira gaveta e o botão é o único jeito de abri-la.
beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as never;
});

const renderizar = (hasMenu = true) =>
  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route path="/dashboard" element={<DashTemplate hasMenu={hasMenu} />}>
          <Route index element={<button>Novo</button>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("DashTemplate — botão do menu lateral", () => {
  it("fica dentro do header, não flutuando sobre a página", () => {
    renderizar();

    const botao = screen.getByRole("button", { name: "Abrir menu" });
    expect(document.getElementById("header")).toContainElement(botao);
    expect(botao).not.toHaveClass("fixed");
  });

  it("abre o menu lateral", () => {
    renderizar();

    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));

    expect(screen.getByTestId("menu-lateral")).toHaveAttribute(
      "data-aberto",
      "true",
    );
  });

  it("a gaveta é um Sheet à esquerda: Esc fecha e o foco volta ao hambúrguer", async () => {
    renderizar();
    const botao = screen.getByRole("button", { name: "Abrir menu" });
    botao.focus();

    fireEvent.click(botao);
    const gaveta = await screen.findByRole("dialog", { name: "Sidebar" });
    expect(gaveta).toHaveAttribute("data-mobile", "true");

    fireEvent.keyDown(gaveta, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(botao).toHaveFocus());
  });

  it("no dash não sobra o hambúrguer do menu público", () => {
    renderizar();

    expect(screen.getAllByRole("button", { name: "Abrir menu" })).toHaveLength(
      1,
    );
    expect(
      document.querySelector("#header .md\\:hidden > svg"),
    ).not.toBeInTheDocument();
  });

  it("sem menu, o header não ganha o botão", () => {
    renderizar(false);

    expect(
      screen.queryByRole("button", { name: "Abrir menu" }),
    ).not.toBeInTheDocument();
  });
});
