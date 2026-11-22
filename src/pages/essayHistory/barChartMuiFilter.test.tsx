import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BarChartWithFilter from "@/components/atoms/barChartMuiFilter";

// O gráfico em si não interessa aqui, e no jsdom ele não tem tamanho.
vi.mock("@mui/x-charts", () => ({ BarChart: () => null }));

const data = [
  { id: "a", label: "Matemática", value: 10 },
  { id: "b", label: "Física", value: 5 },
];

describe("BarChartWithFilter", () => {
  it("o filtro é um botão alternável que esconde e mostra a série", () => {
    render(<BarChartWithFilter data={data} title="Por matéria" />);

    expect(
      screen.getByRole("heading", { name: "Por matéria" }),
    ).toBeInTheDocument();
    const filtro = screen.getByRole("button", { name: "Física" });
    expect(filtro).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(filtro);
    expect(filtro).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(filtro);
    expect(filtro).toHaveAttribute("aria-pressed", "true");
  });
});
