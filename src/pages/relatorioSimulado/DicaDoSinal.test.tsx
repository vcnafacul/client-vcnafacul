import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DicaDoSinal } from "./DicaDoSinal";

const montar = (texto = "A alternativa D foi marcada por menos de 5%.") =>
  render(
    <DicaDoSinal texto={texto}>
      <span>Distrator</span>
    </DicaDoSinal>,
  );

describe("DicaDoSinal", () => {
  it("⚠️ abre em 300ms, não no ~1s do `title` nativo", () => {
    /*
      O motivo do card: o `title` do navegador leva cerca de um segundo e **não
      é configurável** — nem por CSS, nem por JS. Um segundo é tempo suficiente
      para a pessoa concluir que não existe tooltip e seguir em frente, que foi
      o que aconteceu na revisão.
    */
    const { container } = montar();

    const dica = container.querySelector('[role="tooltip"]') as HTMLElement;
    expect(dica.style.transitionDelay).toBe("300ms");
  });

  it("⚠️ NÃO usa o `title` nativo — seriam duas caixas sobre o mesmo badge", () => {
    // Uma com 300ms e outra com ~1s, dizendo a mesma coisa.
    const { container } = montar();

    expect(container.querySelector("[title]")).toBeNull();
  });

  it("o texto fica no DOM, acessível a leitor de tela", () => {
    montar("Explicação completa");

    expect(screen.getByRole("tooltip")).toHaveTextContent("Explicação completa");
  });

  it("⚠️ começa invisível, e é a opacidade que muda — não o `display`", () => {
    // `display` não anima, e sem transição o atraso de 300ms não existiria.
    const { container } = montar();
    const dica = container.querySelector('[role="tooltip"]')!;

    expect(dica.className).toContain("opacity-0");
    expect(dica.className).toContain("group-hover:opacity-100");
    expect(dica.className).toContain("transition-opacity");
  });

  it("⚠️ abre também no foco por teclado", () => {
    // `group-focus-within`, e sem `tabIndex` próprio: um por badge
    // acrescentaria ~125 paradas de tab nesta tabela.
    const { container } = montar();

    expect(
      container.querySelector('[role="tooltip"]')!.className,
    ).toContain("group-focus-within:opacity-100");
  });

  it("⚠️ `pointer-events-none` — senão a dica rouba o hover e pisca", () => {
    const { container } = montar();

    expect(container.querySelector('[role="tooltip"]')!.className).toContain(
      "pointer-events-none",
    );
  });

  it("⚠️ abre para a ESQUERDA — a coluna é a penúltima da tabela", () => {
    // Uma caixa de 18rem crescendo para a direita sairia da tela.
    const { container } = montar();

    expect(container.querySelector('[role="tooltip"]')!.className).toContain(
      "right-0",
    );
  });

  it("⚠️ não sai na impressão — apareceria sobre a linha seguinte", () => {
    const { container } = montar();

    expect(container.querySelector('[role="tooltip"]')!.className).toContain(
      "print:hidden",
    );
  });

  it("o conteúdo embrulhado continua renderizando", () => {
    montar();

    expect(screen.getByText("Distrator")).toBeInTheDocument();
  });
});
