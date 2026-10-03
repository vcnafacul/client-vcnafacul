import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Indicadores } from "@/services/indicadores";

// O (i) tem teste próprio; aqui só interessam os números.
vi.mock("@/components/indicadores/InfoDaMetrica", () => ({
  InfoDaMetrica: () => null,
}));

import { SecoesDosIndicadores } from "./SecoesDosIndicadores";

const dadosDeExemplo = (over: Partial<Indicadores> = {}): Indicadores => ({
  periodo: {
    id: "p1",
    nome: "Período 2026",
    ano: 2026,
    inicio: "2026-02-01",
    fim: "2026-12-10",
    emAndamento: true,
  },
  atualizadoEm: "2026-10-03T17:00:00Z",
  cursinho: {},
  turmas: [],
  serie: [],
  ...over,
});

const turma = (id: string, metricas = {}) => ({ id, nome: id, metricas });

describe("Seções dos indicadores", () => {
  it("alunos do período (02): total do cursinho e quantas turmas", () => {
    render(
      <SecoesDosIndicadores
        dados={dadosDeExemplo({
          cursinho: { alunos: 120 },
          turmas: [turma("A"), turma("B"), turma("C"), turma("D")],
        })}
      />,
    );
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("Alunos no período")).toBeInTheDocument();
    expect(screen.getByText("em 4 turmas")).toBeInTheDocument();
  });
  it("ativos (03): de quantos alunos; no período encerrado vira 'Chegaram ao fim'", () => {
    const { rerender } = render(
      <SecoesDosIndicadores
        dados={dadosDeExemplo({ cursinho: { alunos: 120, ativos: 98 } })}
      />,
    );
    expect(screen.getByText("98")).toBeInTheDocument();
    expect(screen.getByText("Ativos")).toBeInTheDocument();
    expect(screen.getByText("de 120 alunos do período")).toBeInTheDocument();
    // sem fotos de duas semanas, o gráfico explica por que está vazio
    expect(
      screen.getByText(/a partir da segunda semana/),
    ).toBeInTheDocument();

    const encerrado = dadosDeExemplo({ cursinho: { alunos: 120, ativos: 90 } });
    encerrado.periodo.emAndamento = false;
    rerender(<SecoesDosIndicadores dados={encerrado} />);
    expect(screen.getByText("Chegaram ao fim")).toBeInTheDocument();
  });
  it("cancelamentos (04): % dos alunos e motivos do maior para o menor", () => {
    render(
      <SecoesDosIndicadores
        dados={dadosDeExemplo({
          cursinho: {
            alunos: 120,
            ativos: 98,
            cancelados: 22,
            canceladosPorMotivo: {
              Transporte: 4,
              Rotina: 10,
              "Desistência inicial": 6,
              Abandono: 0,
            },
          },
        })}
      />,
    );
    expect(screen.getByText("22")).toBeInTheDocument();
    expect(
      screen.getByText("18,3% dos alunos do período"),
    ).toBeInTheDocument();
    const motivos = screen
      .getAllByRole("listitem")
      .map((li) => li.textContent);
    expect(motivos).toEqual([
      "Rotina10",
      "Desistência inicial · não conta na evasão6",
      "Transporte4",
    ]);
  });
});
