import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EssayStatsTimelineEntry } from "@/dtos/essay";
import CompetencyEvolutionChart from "./CompetencyEvolutionChart";
import CompetencyRadarChart from "./CompetencyRadarChart";
import ScoreEvolutionChart from "./ScoreEvolutionChart";

// O gráfico de linhas só expõe as séries que recebeu.
vi.mock("@/components/atoms/lineChartMui", () => ({
  default: ({ series }: { series: { label: string }[] }) => (
    <ul data-testid="linhas">
      {series.map((s) => (
        <li key={s.label}>{s.label}</li>
      ))}
    </ul>
  ),
}));
vi.mock("@/components/atoms/radarChart", () => ({
  RadarChart: () => <div data-testid="radar" />,
}));
vi.mock("@/components/dashV2/useAcimaDeSm", () => ({
  useAcimaDeSm: () => false,
}));

const nota = (n: number) => ({
  totalScore: n * 5,
  comp1Score: n,
  comp2Score: n,
  comp3Score: n,
  comp4Score: n,
  comp5Score: n,
});

// A correção por IA está desligada: só há correção humana.
const soHumana: EssayStatsTimelineEntry[] = [
  {
    essayId: "1",
    themeTitle: "Tema 1",
    submittedAt: "",
    aiReview: null,
    humanReview: nota(120),
  },
  {
    essayId: "2",
    themeTitle: "Tema 2",
    submittedAt: "",
    aiReview: null,
    humanReview: nota(160),
  },
];

describe("histórico de redações sem correção por IA", () => {
  it("evolução da nota: sem a série 'Correção IA' vazia", () => {
    render(<ScoreEvolutionChart timeline={soHumana} />);

    expect(screen.getByText("Correção Humana")).toBeInTheDocument();
    expect(screen.queryByText("Correção IA")).not.toBeInTheDocument();
  });

  it("evolução por competência abre na Humana em vez de sumir", () => {
    render(<CompetencyEvolutionChart timeline={soHumana} />);

    expect(screen.getByText("Evolução por Competência")).toBeInTheDocument();
    expect(screen.getByTestId("linhas")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "IA" }),
    ).not.toBeInTheDocument();
  });

  it("média por competência: barras no celular, só com a Humana", () => {
    render(<CompetencyRadarChart timeline={soHumana} />);

    expect(screen.queryByTestId("radar")).not.toBeInTheDocument();
    expect(screen.getAllByText("Humana")).toHaveLength(5);
    expect(screen.queryByText("IA")).not.toBeInTheDocument();
    expect(screen.getAllByText("140")).toHaveLength(5);
  });
});
