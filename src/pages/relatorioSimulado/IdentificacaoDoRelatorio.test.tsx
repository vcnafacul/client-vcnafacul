import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ResumoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { SEM_NOME } from "@/pages/partnerClassWithStudents/SimuladosDaTurma";
import { IdentificacaoDoRelatorio } from "./IdentificacaoDoRelatorio";

const resumo = (over: Partial<ResumoDoRelatorio> = {}): ResumoDoRelatorio => ({
  totalNoRecorte: 30,
  comLeituraConcluida: 27,
  aproveitamentoGeral: 0.58,
  totalEstudantesComCartaoNoCursinho: 30,
  linhasSemEstudanteAtivo: 0,
  totalDeQuestoes: 90,
  simuladoNome: "ENEM 2024 — 2ª aplicação",
  turmaNome: null,
  ultimoCartaoEm: "2026-09-21T15:30:00.000Z",
  ...over,
});

describe("IdentificacaoDoRelatorio (card 18)", () => {
  it("o título é o NOME do simulado, não a string fixa", () => {
    render(<IdentificacaoDoRelatorio resumo={resumo()} comTitulo />);

    expect(
      screen.getByRole("heading", { name: "ENEM 2024 — 2ª aplicação" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Relatório do simulado")).not.toBeInTheDocument();
  });

  it("a linha de contexto traz turma, tamanho e data", () => {
    render(
      <IdentificacaoDoRelatorio
        resumo={resumo({ turmaNome: "Turma 3ºA" })}
        comTitulo
      />,
    );

    const ctx = screen.getByTestId("identificacao-do-relatorio");
    expect(ctx).toHaveTextContent("Turma 3ºA");
    expect(ctx).toHaveTextContent("90 questões");
    expect(ctx).toHaveTextContent("último cartão em 21/09/2026");
  });

  it("⚠️ o rótulo é 'último cartão', nunca 'data da prova'", () => {
    // Ela não existe no modelo: `disponivelDe` está preenchida em 0 dos 131
    // simulados. E não é "última atividade" — reenvio não move a data.
    render(<IdentificacaoDoRelatorio resumo={resumo()} comTitulo />);

    const ctx = screen.getByTestId("identificacao-do-relatorio");
    expect(ctx).toHaveTextContent(/último cartão/);
    expect(ctx).not.toHaveTextContent(/data da prova|última atividade/i);
  });

  it("⚠️ sem recorte de turma, a linha não inventa um", () => {
    render(<IdentificacaoDoRelatorio resumo={resumo()} comTitulo />);

    expect(screen.getByTestId("identificacao-do-relatorio")).toHaveTextContent(
      "90 questões · último cartão em 21/09/2026",
    );
  });

  describe("⚠️ os dois significados de `simuladoNome: null`", () => {
    it("simulado APAGADO mostra a constante que a aba da turma já usa", () => {
      // Os cartões existem; escondê-los é pior que rotulá-los.
      render(
        <IdentificacaoDoRelatorio
          resumo={resumo({ simuladoNome: null })}
          comTitulo
        />,
      );

      expect(screen.getByRole("heading", { name: SEM_NOME })).toBeInTheDocument();
    });

    it("recorte VAZIO não diz que o simulado sumiu", () => {
      // A api nem chegou a perguntar ao ms. Dizer "Simulado removido" aqui
      // afirmaria que ele sumiu quando o que está vazio é a turma.
      render(
        <IdentificacaoDoRelatorio
          resumo={resumo({ simuladoNome: null, totalNoRecorte: 0 })}
          comTitulo
        />,
      );

      expect(screen.queryByText(SEM_NOME)).not.toBeInTheDocument();
    });
  });

  it("⚠️ na aba da turma não há título — o seletor já mostra o nome", () => {
    render(
      <IdentificacaoDoRelatorio
        resumo={resumo()}
        comTitulo={false}
      />,
    );

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    // mas o contexto fica
    expect(screen.getByTestId("identificacao-do-relatorio")).toHaveTextContent(
      "90 questões",
    );
  });

  it("⚠️ NÃO é `print:hidden` — é a parte que precisa sair na folha", () => {
    // Todos os controles são escondidos na impressão, o que está certo. O
    // resultado era uma tabela de nomes e notas sem dizer de que prova é.
    render(<IdentificacaoDoRelatorio resumo={resumo()} comTitulo />);

    expect(
      screen.getByTestId("identificacao-do-relatorio").className,
    ).not.toContain("print:hidden");
  });

  it("data ausente some da linha, em vez de virar travessão", () => {
    render(
      <IdentificacaoDoRelatorio
        resumo={resumo({ ultimoCartaoEm: null })}
        comTitulo
      />,
    );

    // ⚠️ Assere no `<p>` do contexto, não no bloco inteiro: o travessão do nome
    // "ENEM 2024 — 2ª aplicação" casaria e o teste passaria/falharia por ele.
    const linha = screen
      .getByTestId("identificacao-do-relatorio")
      .querySelector("p")!;
    expect(linha).toHaveTextContent("90 questões");
    expect(linha.textContent).not.toContain("—");
    expect(linha.textContent).not.toContain("cartão");
  });

  it("data inválida não vira 'Invalid Date' na tela", () => {
    render(
      <IdentificacaoDoRelatorio
        resumo={resumo({ ultimoCartaoEm: "não é data" })}
        comTitulo
      />,
    );

    expect(
      screen.getByTestId("identificacao-do-relatorio"),
    ).not.toHaveTextContent(/Invalid/i);
  });

  it("⚠️ ms antigo: sem total nem data, a linha some — e o título fica", () => {
    render(
      <IdentificacaoDoRelatorio
        resumo={resumo({ totalDeQuestoes: 0, ultimoCartaoEm: null })}
        comTitulo
      />,
    );

    expect(screen.getByRole("heading")).toBeInTheDocument();
  });
});
