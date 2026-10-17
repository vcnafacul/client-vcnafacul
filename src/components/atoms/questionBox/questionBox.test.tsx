import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuestionBoxStatus } from "@/enums/simulado/questionBoxStatus";
import QuestionBox, { DICA_ANULADA } from ".";

describe("QuestionBox anulada (042/11)", () => {
  it("X vermelho, aria-label e dica no toque; não abre a questão", () => {
    const onClick = vi.fn();
    render(<QuestionBox number={45} status={QuestionBoxStatus.anulada} onClick={onClick} />);
    const caixa = screen.getByRole("img", { name: `Questão 45: ${DICA_ANULADA}` });
    expect(caixa.className).toContain("cursor-not-allowed");
    expect(caixa.querySelector("svg")).toBeTruthy();
    fireEvent.click(caixa);
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole("tooltip").textContent).toBe(DICA_ANULADA);
  });

  it("válida continua clicável, sem X", () => {
    const onClick = vi.fn();
    const { container } = render(<QuestionBox number={1} status={QuestionBoxStatus.unread} onClick={onClick} />);
    fireEvent.click(container.firstChild as HTMLElement);
    expect(onClick).toHaveBeenCalled();
    expect(container.querySelector("svg")).toBeNull();
  });
});
