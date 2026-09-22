import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResumoDoRelatorio } from "./ResumoDoRelatorio";
import type { ResumoDoRelatorio as Resumo } from "@/dtos/relatorioSimulado/relatorioSimulado";

const resumo = (over: Partial<Resumo> = {}): Resumo => ({
  totalNoRecorte: 30,
  comLeituraConcluida: 27,
  aproveitamentoGeral: 0.62,
  totalEstudantesComCartaoNoCursinho: 27,
  temEstudanteSemTurma: false,
  linhasSemEstudanteAtivo: 0,
    totalDeQuestoes: 90,
  ...over,
});

describe("ResumoDoRelatorio", () => {
  it("⚠️ mostra as DUAS contagens — sem elas a média parece errada", () => {
    render(<ResumoDoRelatorio resumo={resumo()} />);

    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("27")).toBeInTheDocument();
  });

  it("⚠️ o rótulo é 'No cálculo da média', não 'Com leitura concluída'", () => {
    // a api conta aqui só quem é `completed` E tem nota numérica; o badge da
    // tabela diz "Lido" pelo status sozinho. Com o rótulo antigo, uma linha
    // concluída sem nota põe 28 badges "Lido" em cima de um número 27.
    render(<ResumoDoRelatorio resumo={resumo()} />);

    expect(screen.getByText(/no cálculo da média/i)).toBeInTheDocument();
    expect(screen.queryByText(/com leitura concluída/i)).not.toBeInTheDocument();
  });

  it("média nula vira travessão, não 0%", () => {
    render(<ResumoDoRelatorio resumo={resumo({ aproveitamentoGeral: null })} />);

    expect(screen.queryByText("0%")).not.toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("⚠️ diz que o recorte é só cartão-resposta", () => {
    // sem isto, a primeira pergunta da semana é "cadê o fulano?" — quem
    // respondeu digital não entra neste relatório
    render(<ResumoDoRelatorio resumo={resumo()} />);

    expect(screen.getByText(/cart[ãa]o-resposta/i)).toBeInTheDocument();
  });

  it("linhasSemEstudanteAtivo vira nota quando há", () => {
    render(
      <ResumoDoRelatorio resumo={resumo({ linhasSemEstudanteAtivo: 2 })} />,
    );

    // ⚠️ A contagem é conferida DENTRO da nota, não solta na tela: o próprio
    // resumo já mostra "27" e "62%", então um `/2/` no documento inteiro casa
    // com três nós e não prova que a nota trouxe o número.
    const nota = screen.getByText(/não estão mais/i);

    expect(nota).toBeInTheDocument();
    expect(nota).toHaveTextContent("2");
  });

  it("⚠️ e a nota SOME quando é zero — não escrever '0 estudantes saíram'", () => {
    render(
      <ResumoDoRelatorio resumo={resumo({ linhasSemEstudanteAtivo: 0 })} />,
    );

    expect(screen.queryByText(/não estão mais/i)).not.toBeInTheDocument();
  });
});
