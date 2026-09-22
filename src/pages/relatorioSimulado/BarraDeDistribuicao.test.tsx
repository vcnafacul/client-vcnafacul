import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { BarraDeDistribuicao } from "./BarraDeDistribuicao";

const questao = (over: Partial<QuestaoDoRelatorio> = {}): QuestaoDoRelatorio => ({
  numero: 34,
  questaoId: "q34",
  // ⚠️ Coerente com a invariante da api: `sum(porAlternativa) + semLeitura ===
  // respondentes` (25 + 2 = 27), e `porAlternativa[correta] === acertos` (C=6).
  // Um fixture que a viola faz os testes de soma afirmarem o que a api nunca
  // produz — foi o que aconteceu na primeira versão deste arquivo.
  respondentes: 27,
  acertos: 6,
  erros: 19,
  semLeitura: 2,
  porAlternativa: { A: 2, B: 16, C: 6, D: 1, E: 0 },
  alternativaCorreta: "C",
  ...over,
});

describe("BarraDeDistribuicao", () => {
  it("⚠️ o `title` traz as contagens exatas — a barra é a forma, não o número", () => {
    render(<BarraDeDistribuicao questao={questao()} />);

    const titulo = screen.getByRole("img").getAttribute("title")!;
    expect(titulo).toContain("A: 2");
    expect(titulo).toContain("B: 16");
    expect(titulo).toContain("C: 6");
    expect(titulo).toContain("sem leitura: 2");
    expect(titulo).toContain("27");
  });

  it("⚠️ tem rótulo acessível — não é decoração", () => {
    // `role="img"` sem nome acessível é pior que nada: o leitor de tela anuncia
    // "imagem" e o conteúdo inteiro fica inalcançável.
    render(<BarraDeDistribuicao questao={questao()} />);

    expect(screen.getByRole("img")).toHaveAccessibleName(/distribui/i);
  });

  it("⚠️ o gabarito é marcado por BORDA, não só por cor", () => {
    // Nenhuma cor desta paleta carrega significado sozinha — `green3` mede
    // 3.77:1. Mesma regra do `rotuloDoResultado` e do card 04.
    const { container } = render(<BarraDeDistribuicao questao={questao()} />);

    const gabarito = container.querySelector("[data-gabarito]")!;
    expect(gabarito.className).toMatch(/ring/);
  });

  it("⚠️ o gabarito leva a LETRA, e não só a marca visual", () => {
    render(<BarraDeDistribuicao questao={questao({ alternativaCorreta: "B" })} />);

    expect(screen.getByText("B ✓")).toBeInTheDocument();
  });

  it("gabarito `null` não marca nem rotula nada", () => {
    const { container } = render(
      <BarraDeDistribuicao questao={questao({ alternativaCorreta: null })} />,
    );

    expect(container.querySelector("[data-gabarito]")).toBeNull();
    expect(screen.queryByText(/✓/)).not.toBeInTheDocument();
  });

  it("sem respondentes mostra travessão, não barra vazia", () => {
    render(
      <BarraDeDistribuicao
        questao={questao({ respondentes: 0, porAlternativa: {}, semLeitura: 0 })}
      />,
    );

    expect(screen.getByText("—")).toBeInTheDocument();
  });

});
