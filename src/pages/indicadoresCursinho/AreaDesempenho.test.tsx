import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { Desempenho } from "@/services/indicadores";

vi.mock("@/components/indicadores/InfoDaMetrica", () => ({
  InfoDaMetrica: () => null,
}));

import { AreaDesempenho } from "./AreaDesempenho";

const aplicacao = (nome: string, media: number | null, em: string) => ({
  simuladoId: nome,
  nome,
  em,
  media,
  participantes: 20,
});

const renderArea = (dados: Desempenho) =>
  render(
    <AreaDesempenho dados={dados} carregando={false} erro={false} carregar={() => {}} />,
    { wrapper: MemoryRouter },
  );

describe("AreaDesempenho", () => {
  it("um simulado só: diz qual e a média, e que a curva vem com o segundo", () => {
    renderArea({
      aplicacoes: [aplicacao("Simulado de março", 58, "2026-03-10T13:00:00Z")],
      porTurma: [],
      porMes: [],
    });
    expect(
      screen.getByText(/um simulado aplicado: Simulado de março, com média de 58%/),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ir para Provas/ })).toBeInTheDocument();
  });

  it("por mês: participação e média de simulados e redação", () => {
    renderArea({
      aplicacoes: [],
      porTurma: [],
      porMes: [
        {
          mes: "2026-09",
          simulados: { participantes: 34, media: 57.5 },
          redacao: { corrigidas: 12, media: 640 },
        },
        {
          mes: "2026-10",
          simulados: { participantes: 0, media: null },
          redacao: { corrigidas: 3, media: 700 },
        },
      ],
    });
    expect(screen.getByText("set/26")).toBeInTheDocument();
    expect(screen.getByText("34 alunos · 57,5%")).toBeInTheDocument();
    expect(screen.getByText("12 corrigidas · nota 640")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
