import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("size=icon exige aria-label no tipo", () => {
    // @ts-expect-error — sem aria-label, o botão de ícone não compila
    const semNome = <Button size="icon" />;
    const comNome = <Button size="icon" aria-label="Editar" />;
    render(
      <>
        {semNome}
        {comNome}
      </>,
    );
    expect(screen.getByRole("button", { name: "Editar" })).toBeTruthy();
  });

  it("loading deixa o botão desabilitado e mostra o spinner", () => {
    render(<Button loading>Salvar</Button>);
    const botao = screen.getByRole("button", { name: /Salvar/ });
    expect(botao).toBeDisabled();
    expect(botao).toHaveAttribute("aria-busy", "true");
    // O spinner é decorativo: o nome acessível continua o do botão.
    expect(botao.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("sem loading não mostra spinner", () => {
    render(<Button>Salvar</Button>);
    expect(screen.queryByLabelText("Carregando")).toBeNull();
  });

  it("sem variant e sem size, usa primary e md", () => {
    render(<Button>Ok</Button>);
    const botao = screen.getByRole("button", { name: "Ok" });
    expect(botao.className).toContain("bg-primary");
    expect(botao.className).toContain("sm:h-9");
  });

  it("asChild repassa o estilo ao filho", () => {
    render(
      <Button asChild variant="cta">
        <a href="/x">Ir</a>
      </Button>,
    );
    expect(screen.getByRole("link", { name: "Ir" }).className).toContain("bg-cta");
  });
});
