import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ModalAddQuestionToProva } from "./ModalAddQuestionToProva";

vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));
vi.mock("@/services/prova/getMissingNumber", () => ({
  getMissingNumber: vi.fn().mockResolvedValue([]),
}));

const provas = [
  {
    _id: "dia1",
    nome: "ENEM 2026 Dia 1",
    enemAreas: ["Linguagens", "Ciências Humanas"],
  },
  {
    _id: "dia2",
    nome: "ENEM 2026 Dia 2",
    enemAreas: ["Ciências da Natureza", "Matemática"],
  },
  { _id: "custom", nome: "Simulado do cursinho", enemAreas: [] },
];

const montar = (enemArea?: string) =>
  render(
    <ModalAddQuestionToProva
      provas={provas}
      provaIdsJaVinculadas={[]}
      enemArea={enemArea}
      onConfirm={vi.fn()}
      onClose={vi.fn()}
    />,
  );

const botao = (c: HTMLElement, id: string) =>
  c.querySelector(`[data-prova="${id}"]`) as HTMLButtonElement;

describe("ModalAddQuestionToProva — área × prova (area-enem 02)", () => {
  it("⚠️ a prova ENEM que não aceita a área aparece desabilitada, com o motivo", () => {
    // O caso do relato: questão de Linguagens e a ENEM Dia 2.
    const { container } = montar("Linguagens");

    expect(botao(container, "dia2").disabled).toBe(true);
    expect(botao(container, "dia2").textContent).toContain(
      "não aceita Linguagens",
    );
  });

  it("a prova do dia da área e a customizada continuam habilitadas", () => {
    const { container } = montar("Linguagens");

    expect(botao(container, "dia1").disabled).toBe(false);
    expect(botao(container, "custom").disabled).toBe(false);
  });

  it("sem área na questão, nada fica desabilitado", () => {
    const { container } = montar(undefined);

    expect(botao(container, "dia2").disabled).toBe(false);
  });
});
