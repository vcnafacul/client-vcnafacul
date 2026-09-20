import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashTable } from "@/components/dashV2";
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
  cartaoCode: "07",
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

  it("⚠️ linha que falhou ordena como nula, não pela nota velha", () => {
    // senão ela sobe ao topo do 'ordenar por aproveitamento' com a célula vazia
    const col = colunasDoRelatorio({ comTurma: false }).find(
      (c) => c.id === "aproveitamento",
    )!;

    expect(
      col.sortValue!(linha({ status: "failed", aproveitamentoGeral: 0.92 })),
    ).toBeNull();
    expect(col.sortValue!(linha({ aproveitamentoGeral: 0.92 }))).toBe(0.92);
  });

  it("cartaoCode aparece mesmo numa linha que falhou — é qual folha refotografar", () => {
    celula("cartao", linha({ status: "failed", cartaoCode: "07" }));

    expect(screen.getByText("07")).toBeInTheDocument();
  });

  it("⚠️ NÃO existe coluna de questões respondidas", () => {
    // `questoesRespondidas` só é gravado no `createPending`, do fluxo digital;
    // toda linha daqui é de cartão. A coluna renderizaria "—" para sempre, o
    // que se lê como dado perdido e não como dado que nunca foi coletado.
    const ids = colunasDoRelatorio({ comTurma: false }).map((c) => c.id);

    expect(ids).not.toContain("respondidas");
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

  it("⚠️ linha COMPLETED que ainda carrega falha antiga não mostra o motivo", () => {
    // `completeProcessing` não desfaz `falha`, e o `$unset` é de um card
    // futuro que não existe. Sem este gate a linha diz "Lido", "80%" e
    // "não foi possível localizar o cartão" ao mesmo tempo.
    celula(
      "motivo",
      linha({
        status: "completed",
        falha: {
          codigo: "cartao_nao_detectado",
          descricao: "Não foi possível localizar o cartão na foto",
          acaoSugerida: "reenviar_foto",
        },
      }),
    );

    expect(screen.queryByText(/localizar o cartão/i)).not.toBeInTheDocument();
  });

  it("⚠️ e durante o reprocessamento (pending) também não", () => {
    celula(
      "motivo",
      linha({
        status: "pending",
        falha: {
          codigo: "cartao_nao_detectado",
          descricao: "Não foi possível localizar o cartão na foto",
          acaoSugerida: "reenviar_foto",
        },
      }),
    );

    expect(screen.queryByText(/localizar o cartão/i)).not.toBeInTheDocument();
  });

  /**
   * ⚠️ O motivo **tem** de ser string crua. O `DashTable` embrulha toda célula
   * não-primária num `span.block.truncate`, e o `tituloDe` dele só consegue
   * emitir `title` quando o `cell` devolveu texto — um `<span>` ganharia o
   * truncamento e nenhum `title`, que é o pior dos dois mundos numa coluna
   * cujo propósito é ser lida por inteiro.
   */
  it("⚠️ o motivo truncado ainda dá para ler: o DashTable põe title na célula", () => {
    render(
      <DashTable<LinhaDoRelatorio>
        rows={[
          linha({
            status: "failed",
            falha: {
              codigo: "cartao_nao_detectado",
              descricao: "Não foi possível localizar o cartão na foto",
              acaoSugerida: "reenviar_foto",
            },
          }),
        ]}
        columns={colunasDoRelatorio({ comTurma: false })}
        rowKey={(l) => l.usuario}
      />,
    );

    expect(screen.getByText(/localizar o cartão/i)).toHaveAttribute(
      "title",
      "Não foi possível localizar o cartão na foto",
    );
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

  it("⚠️ Status ordena pelo trabalho do coordenador, não pelo alfabeto", () => {
    // alfabético daria Aguardando < Falhou < Lido < Não enviou
    const col = colunasDoRelatorio({ comTurma: false }).find(
      (c) => c.id === "status",
    )!;
    const de = (over: Partial<LinhaDoRelatorio>) => col.sortValue!(linha(over));

    expect([
      de({ status: "failed" }),
      de({ status: "awaiting_omr" }),
      de({ enviouCartao: false, status: undefined }),
      de({ status: "completed" }),
    ]).toEqual([0, 1, 2, 3]);
  });

  it("ordena por nome com regra pt-BR", () => {
    const col = colunasDoRelatorio({ comTurma: false }).find(
      (c) => c.id === "estudante",
    )!;

    expect(col.sortValue!(linha({ nome: "Ática" }))).toBe("Ática");
  });
});
