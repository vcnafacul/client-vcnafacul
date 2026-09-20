import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { colunasDoRelatorio } from "./colunas";
import type { LinhaDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";

const linha = (over: Partial<LinhaDoRelatorio> = {}): LinhaDoRelatorio => ({
  usuario: "u1",
  nome: "Ana Silva",
  matricula: "2025001",
  turmaId: "t-1",
  turmaNome: "Turma A",
  enviouCartao: true,
  status: "completed",
  aproveitamentoGeral: 0.8,
  questoesRespondidas: 90,
  ...over,
});

const celula = (id: string, l: LinhaDoRelatorio, comTurma = false) => {
  const col = colunasDoRelatorio({ comTurma }).find((c) => c.id === id)!;
  render(<>{col.cell(l)}</>);
};

describe("colunas do relatório", () => {
  it("⚠️ linha que FALHOU não mostra nota, mesmo trazendo uma", () => {
    // O `marcarFalha` do ms não limpa `aproveitamento`: um cartão que leu bem,
    // foi refotografado e falhou mantém a nota antiga, e a api repassa como
    // veio — de propósito. Mostrar aqui contradiz o status na mesma linha.
    celula("aproveitamento", linha({ status: "failed", aproveitamentoGeral: 0.2 }));

    expect(screen.queryByText(/20/)).not.toBeInTheDocument();
  });

  it.each([["awaiting_omr"], ["pending"], ["processing"]])(
    "status %s também não mostra nota",
    (status) => {
      celula(
        "aproveitamento",
        linha({ status: status as never, aproveitamentoGeral: 0.5 }),
      );

      expect(screen.queryByText(/50/)).not.toBeInTheDocument();
    },
  );

  it("linha lida mostra a nota em porcentagem", () => {
    celula("aproveitamento", linha({ aproveitamentoGeral: 0.8 }));

    expect(screen.getByText(/80/)).toBeInTheDocument();
  });

  it("⚠️ nota ausente é vazio, nunca zero — zero é uma nota", () => {
    celula("aproveitamento", linha({ aproveitamentoGeral: undefined }));

    expect(screen.queryByText("0%")).not.toBeInTheDocument();
  });

  it("o motivo é coluna própria, com a descrição que o ms mandou pronta", () => {
    celula(
      "motivo",
      linha({
        status: "failed",
        falha: {
          codigo: "cartao_nao_detectado",
          descricao: "Não foi possível localizar o cartão na foto",
          acaoSugerida: "reenviar_foto",
        },
      }),
    );

    expect(
      screen.getByText(/não foi possível localizar o cartão/i),
    ).toBeInTheDocument();
  });

  it("estudante mostra nome e matrícula", () => {
    celula("estudante", linha());

    expect(screen.getByText("Ana Silva")).toBeInTheDocument();
    expect(screen.getByText(/2025001/)).toBeInTheDocument();
  });

  it("sem turma no recorte, a coluna Turma EXISTE", () => {
    const ids = colunasDoRelatorio({ comTurma: false }).map((c) => c.id);

    expect(ids).toContain("turma");
  });

  it("⚠️ com turma no recorte, a coluna Turma SOME — seria constante", () => {
    const ids = colunasDoRelatorio({ comTurma: true }).map((c) => c.id);

    expect(ids).not.toContain("turma");
  });

  it("estudante sem turma mostra travessão, não vazio", () => {
    celula("turma", linha({ turmaNome: null, turmaId: null }));

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("ordena por nome com regra pt-BR", () => {
    const col = colunasDoRelatorio({ comTurma: false }).find(
      (c) => c.id === "estudante",
    )!;

    expect(col.sortValue!(linha({ nome: "Ática" }))).toBe("Ática");
  });
});
