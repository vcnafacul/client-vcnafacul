import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import MenuMobile from ".";

vi.mock("../../../assets/images/home/logo.svg", () => ({
  ReactComponent: () => <svg />,
}));

const item = (id: number, name: string, link: string) => ({
  Home_Menu_Item_id: { id, name, link, target: "_self" },
});

const itens = [
  item(1, "Quem Somos", "/quem-somos"),
  item(2, "Localize um Cursinho", "/#map"),
  item(3, "Novidades", "/novidades"),
];

const abrir = (props: Partial<Parameters<typeof MenuMobile>[0]> = {}) => {
  const onClose = vi.fn();
  render(
    <MemoryRouter initialEntries={["/novidades"]}>
      <MenuMobile open onClose={onClose} itens={itens} redes={[]} {...props} />
    </MemoryRouter>,
  );
  return onClose;
};

describe("MenuMobile", () => {
  it("fechado, não desenha nada", () => {
    render(
      <MemoryRouter>
        <MenuMobile open={false} onClose={() => {}} itens={itens} redes={[]} />
      </MemoryRouter>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("lista os itens e marca a página atual", () => {
    abrir();

    const nav = screen.getByRole("navigation", { name: "Menu principal" });
    expect(nav).toHaveTextContent("Quem Somos");
    expect(nav).toHaveTextContent("Localize um Cursinho");
    expect(screen.getByRole("link", { name: "Novidades" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "Quem Somos" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("fecha pelo X, pelo Esc e ao escolher um item", () => {
    const onClose = abrir();

    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    fireEvent.click(screen.getByRole("link", { name: "Quem Somos" }));

    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("abre pelo hambúrguer, tem título acessível, e o foco volta ao fechar", async () => {
    const Casca = () => {
      const [aberto, setAberto] = useState(false);
      return (
        <MemoryRouter>
          <MenuMobile
            open={aberto}
            onOpen={() => setAberto(true)}
            onClose={() => setAberto(false)}
            gatilho={
              <button
                type="button"
                aria-label="Abrir menu do site"
                aria-expanded={aberto}
              />
            }
            itens={itens}
            redes={[]}
          />
        </MemoryRouter>
      );
    };
    render(<Casca />);
    const hamburguer = screen.getByRole("button", {
      name: "Abrir menu do site",
    });
    hamburguer.focus();
    expect(hamburguer).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(hamburguer);
    const dialogo = await screen.findByRole("dialog", { name: "Menu" });
    await waitFor(() =>
      expect(dialogo).toContainElement(document.activeElement as HTMLElement),
    );

    fireEvent.keyDown(dialogo, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(hamburguer).toHaveFocus());
  });

  it("trava a rolagem da página enquanto aberto", async () => {
    const { rerender } = render(
      <MemoryRouter>
        <MenuMobile open onClose={() => {}} itens={itens} redes={[]} />
      </MemoryRouter>,
    );
    // O react-remove-scroll do Radix marca o body enquanto o Sheet está aberto.
    await waitFor(() =>
      expect(document.body).toHaveAttribute("data-scroll-locked"),
    );

    rerender(
      <MemoryRouter>
        <MenuMobile open={false} onClose={() => {}} itens={itens} redes={[]} />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(document.body).not.toHaveAttribute("data-scroll-locked"),
    );
  });

  it("sem login, oferece Entrar e Cadastrar; com login, saúda pelo nome", () => {
    abrir({
      entrar: item(2, "Login", "/login"),
      cadastrar: item(1, "Cadastro", "/cadastro"),
    });
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("link", { name: /Cadastrar/ })).toHaveAttribute(
      "href",
      "/cadastro",
    );
  });

  it("com login, sem Entrar/Cadastrar e com saudação", () => {
    abrir({ nome: "Ana" });
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Entrar" }),
    ).not.toBeInTheDocument();
  });
});
