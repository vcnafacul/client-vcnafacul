import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TabelaDeQuestoes } from "./TabelaDeQuestoes";
import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";

const questao = (
  over: Partial<QuestaoDoRelatorio> = {},
): QuestaoDoRelatorio => ({
  numero: 5,
  questaoId: "q5",
  respondentes: 20,
  acertos: 12,
  erros: 6,
  semLeitura: 2,
  porAlternativa: { A: 12, B: 3, C: 2, D: 1, E: 0 },
  ...over,
});

/**
 * ⚠️ A célula é buscada pela COLUNA, não por texto solto na tela. Os números
 * desta tabela se repetem entre colunas por natureza — `acertos: 12` e
 * `A: 12` são o mesmo 12 — e um `getByText("12")` ou casa com dois nós ou
 * passa sem provar que o número caiu na coluna certa.
 */
const celula = (container: HTMLElement, colunaId: string) =>
  container.querySelector(`[data-column-id="${colunaId}"]`)!;

describe("TabelaDeQuestoes", () => {
  it("mostra número, acertos, erros e sem leitura", () => {
    const { container } = render(
      <TabelaDeQuestoes questoes={[questao()]} estado="idle" />,
    );

    expect(celula(container, "numero")).toHaveTextContent("5");
    expect(celula(container, "acertos")).toHaveTextContent("12");
    expect(celula(container, "erros")).toHaveTextContent("6");
    expect(celula(container, "semLeitura")).toHaveTextContent("2");
  });

  it("⚠️ questão sem número não some da lista", () => {
    // um simulado com questão sem número nunca é liberado, mas o código não
    // pode presumir: sumir seria pior que aparecer fora de ordem
    const { container } = render(
      <TabelaDeQuestoes questoes={[questao({ numero: null })]} estado="idle" />,
    );

    expect(celula(container, "acertos")).toHaveTextContent("12");
    expect(celula(container, "numero")).toHaveTextContent("—");
  });

  it("mostra a distribuição por alternativa", () => {
    const { container } = render(
      <TabelaDeQuestoes questoes={[questao()]} estado="idle" />,
    );

    const distribuicao = celula(container, "distribuicao");

    expect(distribuicao).toHaveTextContent("A 12");
    // ⚠️ Alternativa com zero aparece: a ausência dela leria como "ninguém
    // marcou E porque E não existe", que é outra afirmação.
    expect(distribuicao).toHaveTextContent("E 0");
  });

  it("lista vazia mostra estado vazio, não tabela em branco", () => {
    render(<TabelaDeQuestoes questoes={[]} estado="idle" />);

    expect(screen.getByText(/nenhum/i)).toBeInTheDocument();
  });
});
