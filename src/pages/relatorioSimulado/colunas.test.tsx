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

  it("⚠️ NÃO existe coluna de questões respondidas", () => {
    // `questoesRespondidas` só é gravado no `createPending`, do fluxo digital;
    // toda linha daqui é de cartão. A coluna renderizaria "—" para sempre, o
    // que se lê como dado perdido e não como dado que nunca foi coletado.
    const ids = colunasDoRelatorio({ comTurma: false }).map((c) => c.id);

    expect(ids).not.toContain("respondidas");
  });

  /**
   * ⚠️ Os testes de `Cartão` e `Motivo` como colunas próprias saíram com elas
   * (card 19): cartão, motivo e o gate de `failed` passaram a ser asserções da
   * coluna `Situação`, no describe do card 19 mais abaixo — inclusive o caso
   * `completed` com falha velha e o `pending` durante reprocessamento.
   *
   * ⚠️ **O teste do `title` NÃO sobreviveu, e a troca foi deliberada.** Ele
   * dizia que o motivo tinha de ser string crua para o `tituloDe` do
   * `DashTable` emitir `title`, porque assim o texto truncado ainda dava para
   * ler no hover. O card 19 resolve o problema na raiz: empilhado com
   * `whitespace-normal`, o motivo não trunca — não há o que revelar no hover, e
   * `title` nunca foi acessível por teclado nem por leitor de tela.
   */
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

describe("colunas do relatório — Situação (card 19, parte A)", () => {
  /**
   * O card 19: quatro das seis colunas eram sobre o CARTÃO, não sobre o aluno.
   * Estava certo quando a tela nasceu para conferir leitura; deixa de estar
   * quando a leitura funciona e a pergunta vira "como foram".
   *
   * `Status` + `Cartão` + `Motivo` colapsam em `Situação`, no mesmo padrão de
   * linhas empilhadas que a coluna `Estudante` já usa. As duas colunas
   * liberadas pagam pelas colunas de matéria do card 07.
   */
  const falha = {
    codigo: "cartao_nao_detectado",
    descricao: "Não foi possível localizar o cartão na foto",
    acaoSugerida: "reenviar_foto",
  } as const;

  const ids = (comTurma = false) =>
    colunasDoRelatorio({ comTurma }).map((c) => c.id);

  it.each(["status", "cartao", "motivo"])(
    "⚠️ a coluna `%s` deixou de existir",
    (id) => {
      expect(ids()).not.toContain(id);
    },
  );

  it("`Situação` existe, e a tabela caiu para 4 colunas", () => {
    expect(ids()).toEqual([
      "estudante",
      "turma",
      "situacao",
      "aproveitamento",
    ]);
  });

  it("empilha badge, cartão e motivo numa célula só", () => {
    celula("situacao", linha({ status: "failed", cartaoCode: "0155", falha }));

    expect(screen.getByText("Falhou")).toBeInTheDocument();
    expect(screen.getByText(/0155/)).toBeInTheDocument();
    expect(
      screen.getByText(/não foi possível localizar o cartão/i),
    ).toBeInTheDocument();
  });

  it("⚠️ a linha só cresce quando há motivo", () => {
    // São poucas linhas e são as que merecem ocupar mais espaço. Numa linha
    // lida, nada de motivo aparece — nem um nó vazio que reservasse altura.
    const { container } = render(
      <>{colunasDoRelatorio({ comTurma: false }).find((c) => c.id === "situacao")!.cell(linha({ status: "completed", cartaoCode: "0142" }))}</>,
    );

    expect(container.querySelector("[data-motivo]")).toBeNull();
    expect(screen.getByText("Lido")).toBeInTheDocument();
  });

  it("⚠️ o motivo NÃO trunca — tem a largura inteira da célula", () => {
    // O `DashTable` embrulha toda célula num `span.block.truncate`, e
    // `truncate` inclui `white-space: nowrap`. Sem sobrepor isso no filho, o
    // motivo continuaria numa linha só e cortado — o defeito que esta coluna
    // existe para consertar.
    const { container } = render(
      <>{colunasDoRelatorio({ comTurma: false }).find((c) => c.id === "situacao")!.cell(linha({ status: "failed", cartaoCode: "0155", falha }))}</>,
    );

    expect(container.querySelector("[data-motivo]")).toHaveClass(
      "whitespace-normal",
    );
  });

  it("⚠️ `cartaoCode` aparece mesmo na linha que falhou", () => {
    // Fora do gate de `leituraVale`, pelo motivo já documentado: é a identidade
    // da folha física, não resultado da leitura — e numa linha falha é a
    // informação mais acionável que existe, porque diz qual refotografar.
    celula("situacao", linha({ status: "failed", cartaoCode: "0155", falha }));

    expect(screen.getByText(/0155/)).toBeInTheDocument();
  });

  it("quem não enviou não mostra cartão nenhum", () => {
    const { container } = render(
      <>{colunasDoRelatorio({ comTurma: false }).find((c) => c.id === "situacao")!.cell(linha({ enviouCartao: false, status: undefined, cartaoCode: undefined }))}</>,
    );

    expect(screen.getByText("Não enviou")).toBeInTheDocument();
    expect(container.querySelector("[data-cartao]")).toBeNull();
  });

  it("⚠️ linha COMPLETED com falha velha não mostra o motivo", () => {
    // `completeProcessing` não desfaz `falha`. Sem gate a célula diria "Lido"
    // e "não foi possível localizar o cartão" ao mesmo tempo.
    const { container } = render(
      <>{colunasDoRelatorio({ comTurma: false }).find((c) => c.id === "situacao")!.cell(linha({ status: "completed", falha }))}</>,
    );

    expect(container.querySelector("[data-motivo]")).toBeNull();
  });

  it("⚠️ a ordenação continua pelo `statusDaLinha().ordem`", () => {
    // Fácil de quebrar sem querer ao mexer na célula: ordenar pelo texto
    // concatenado daria ordem alfabética, que não é ordem de trabalho nenhuma.
    const col = colunasDoRelatorio({ comTurma: false }).find(
      (c) => c.id === "situacao",
    )!;

    expect(col.sortValue!(linha({ status: "failed" }))).toBe(0);
    expect(col.sortValue!(linha({ status: "pending" }))).toBe(1);
    expect(col.sortValue!(linha({ enviouCartao: false }))).toBe(2);
    expect(col.sortValue!(linha({ status: "completed" }))).toBe(3);
  });
});
