import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { HistoricoDTO } from "../../../dtos/historico/historicoDTO";
import { SimulationHistoryHeader } from ".";

// Os gráficos não interessam aqui, e no jsdom não têm tamanho.
vi.mock("@mui/x-charts", () => ({ PieChart: () => null }));
vi.mock("../../atoms/radarChart", () => ({
  RadarChart: () => <div data-testid="radar" />,
}));
vi.mock("../../dashV2/useAcimaDeSm", () => ({ useAcimaDeSm: () => false }));

const historico = (extra: Partial<HistoricoDTO> = {}) =>
  ({
    _id: "h1",
    usuario: "u1",
    ano: 2026,
    simulado: { _id: "s1", nome: "Matemática", questoes: [] },
    respostas: [
      { questao: "q1", alternativaCorreta: "A", alternativaEstudante: "A" },
      { questao: "q2", alternativaCorreta: "B", alternativaEstudante: "C" },
    ],
    tempoRealizado: 600,
    questoesRespondidas: 2,
    aproveitamento: {
      geral: 0.5,
      materias: [
        {
          id: "m1",
          nome: "Matemática",
          aproveitamento: 0.5,
          frentes: [
            { id: "f1", nome: "Geometria Plana", aproveitamento: 1 },
            { id: "f2", nome: "Álgebra", aproveitamento: 0 },
          ],
        },
      ],
    },
    createdAt: new Date(),
    ...extra,
  }) as unknown as HistoricoDTO;

const renderizar = (h: HistoricoDTO) =>
  render(
    <MemoryRouter>
      <SimulationHistoryHeader historic={h} />
    </MemoryRouter>,
  );

describe("SimulationHistoryHeader no celular", () => {
  it("o modo Frentes vira barras em vez do radar", () => {
    renderizar(historico());

    fireEvent.click(screen.getByRole("button", { name: /Frentes/ }));

    expect(screen.queryByTestId("radar")).not.toBeInTheDocument();
    expect(
      screen.getByText("Matemática - Geometria Plana"),
    ).toBeInTheDocument();
    expect(screen.getByText("Matemática - Álgebra")).toBeInTheDocument();
    expect(
      screen.getByText("Melhor: Matemática - Geometria Plana (100.0%)"),
    ).toBeInTheDocument();
  });

  it("processando: o título branco fica sobre o fundo marinho", () => {
    const { container } = renderizar(
      historico({ aproveitamento: undefined, status: "pending" }),
    );

    expect(screen.getByText("Processando resultados...")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass("bg-marine");
  });
});
