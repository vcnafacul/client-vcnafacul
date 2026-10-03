import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { Indicadores } from "@/services/indicadores";

// O (i) tem teste próprio; aqui só interessam os números.
vi.mock("@/components/indicadores/InfoDaMetrica", () => ({
  InfoDaMetrica: () => null,
}));

import { SecoesDosIndicadores } from "./SecoesDosIndicadores";

const renderSecoes = (ui: React.ReactElement) =>
  render(ui, { wrapper: MemoryRouter });

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
    renderSecoes(
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
    const { rerender } = renderSecoes(
      <SecoesDosIndicadores
        dados={dadosDeExemplo({ cursinho: { alunos: 120, ativos: 98 } })}
      />,
    );
    expect(screen.getByText("98")).toBeInTheDocument();
    // rótulo do card + opção do seletor do gráfico (05 acrescentou Evasão)
    expect(screen.getAllByText("Ativos")).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: "Evasão" }),
    ).toBeInTheDocument();
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
    renderSecoes(
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
  it("evasão (05): taxa sem a desistência inicial, que aparece à parte", () => {
    renderSecoes(
      <SecoesDosIndicadores
        dados={dadosDeExemplo({
          cursinho: {
            alunos: 120,
            ativos: 98,
            cancelados: 22,
            desistenciaInicial: 6,
            canceladosPorMotivo: {},
          },
        })}
      />,
    );
    expect(screen.getByText("14%")).toBeInTheDocument();
    expect(
      screen.getByText("16 de 114 alunos · 6 desistências iniciais à parte"),
    ).toBeInTheDocument();
  });
  it("turmas (06): ordem pela evasão, selo na maior elegível e link para a turma", () => {
    renderSecoes(
      <SecoesDosIndicadores
        dados={dadosDeExemplo({
          turmas: [
            turma("Manhã", { alunos: 20, ativos: 18, cancelados: 2 }),
            turma("Noite", { alunos: 20, ativos: 14, cancelados: 6 }),
            turma("Sábado", { alunos: 5, ativos: 3, cancelados: 2 }),
          ],
        })}
      />,
    );
    const linhas = screen.getAllByRole("row").slice(1);
    expect(linhas.map((l) => within(l).getAllByRole("cell")[0].textContent)).toEqual([
      "Sábado",
      "NoiteMaior evasão",
      "Manhã",
    ]);
    expect(within(linhas[1]).getByText("30%")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Noite" })).toHaveAttribute(
      "href",
      "/dashboard/turmas/Noite",
    );
  });
  it("frequência (07): soma antes de dividir; turma sem chamada fica 'sem chamadas'", () => {
    renderSecoes(
      <SecoesDosIndicadores
        dados={dadosDeExemplo({
          cursinho: {
            presencas: 100,
            chamadasAluno: 120,
            faltasJustificadas: 4,
            aulasRegistradas: 64,
          },
          turmas: [
            turma("A", { presencas: 90, chamadasAluno: 100, aulasRegistradas: 50 }),
            turma("B", { presencas: 10, chamadasAluno: 20, aulasRegistradas: 14 }),
            turma("C", { aulasRegistradas: 0 }),
          ],
        })}
      />,
    );
    expect(screen.getByText("83,3%")).toBeInTheDocument();
    expect(
      screen.getByText("em 64 aulas registradas · 3,3% de faltas justificadas"),
    ).toBeInTheDocument();
    expect(screen.getByText("90%")).toBeInTheDocument();
    expect(screen.getByText("sem chamadas")).toBeInTheDocument();
  });
});
