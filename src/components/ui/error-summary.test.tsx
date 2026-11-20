import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorSummary } from "./error-summary";

describe("ErrorSummary (D19)", () => {
  it("com 1 item diz '1 problema impede salvar'", () => {
    render(<ErrorSummary items={[{ message: "Informe o enunciado.", onGoTo: () => {} }]} />);
    expect(screen.getByText("1 problema impede salvar")).toBeTruthy();
  });

  it("com 2 itens diz '2 problemas impedem salvar'", () => {
    render(
      <ErrorSummary
        items={[
          { message: "A", where: "aba Alternativas", onGoTo: () => {} },
          { message: "B", onGoTo: () => {} },
        ]}
      />,
    );
    expect(screen.getByText("2 problemas impedem salvar")).toBeTruthy();
    expect(screen.getByText("aba Alternativas")).toBeTruthy();
  });

  it("'Ir até o campo' chama onGoTo", () => {
    const onGoTo = vi.fn();
    render(<ErrorSummary items={[{ message: "A", onGoTo }]} />);
    fireEvent.click(screen.getByRole("button", { name: /Ir até o campo/ }));
    expect(onGoTo).toHaveBeenCalledTimes(1);
  });

  it("sem itens não renderiza nada", () => {
    const { container } = render(<ErrorSummary items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
