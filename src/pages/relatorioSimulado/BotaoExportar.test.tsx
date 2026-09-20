import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { BotaoExportar, TEXTO_SEM_DADOS } from "./BotaoExportar";

const exportAnalyticsCsv = vi.hoisted(() => vi.fn());
vi.mock("@/utils/exportAnalyticsCsv", () => ({ exportAnalyticsCsv }));

const PLANILHA = {
  cabecalho: ["Nome", "Total"],
  linhas: [["Ana", 3] as (string | number | null)[]],
};

beforeEach(() => vi.clearAllMocks());

describe("BotaoExportar", () => {
  it("baixa a planilha recebida, com o nome pedido", () => {
    render(<BotaoExportar planilha={PLANILHA} nomeArquivo="arq-1" />);

    fireEvent.click(screen.getByTestId("exportar-csv"));

    expect(exportAnalyticsCsv).toHaveBeenCalledWith(
      PLANILHA.cabecalho,
      PLANILHA.linhas,
      "arq-1",
    );
  });

  it("⚠️ sem linha nenhuma fica DESABILITADO, não escondido", () => {
    // Um botão que some deixa a pessoa procurando onde ele foi parar.
    // Desabilitado com o rótulo trocado diz que a exportação existe e por que
    // não dá agora.
    render(
      <BotaoExportar
        planilha={{ cabecalho: ["A"], linhas: [] }}
        nomeArquivo="x"
      />,
    );

    const botao = screen.getByTestId("exportar-csv");
    expect(botao).toBeDisabled();
    expect(botao.textContent).toBe(TEXTO_SEM_DADOS);
  });

  it("desabilitado não dispara download", () => {
    render(
      <BotaoExportar
        planilha={{ cabecalho: ["A"], linhas: [] }}
        nomeArquivo="x"
      />,
    );

    fireEvent.click(screen.getByTestId("exportar-csv"));

    expect(exportAnalyticsCsv).not.toHaveBeenCalled();
  });

  it("aceita rótulo próprio, para diferenciar os dois botões da tela", () => {
    render(
      <BotaoExportar planilha={PLANILHA} nomeArquivo="x" rotulo="Baixar tudo" />,
    );

    expect(screen.getByText("Baixar tudo")).toBeInTheDocument();
  });
});
