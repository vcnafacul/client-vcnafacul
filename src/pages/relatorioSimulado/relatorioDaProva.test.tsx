import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  LinhaDoRelatorio,
  ResumoDoRelatorio,
} from "@/dtos/relatorioSimulado/relatorioSimulado";
import { colunasDoRelatorio } from "./colunas";
import { planilhaDeEstudantes } from "./exportar";
import { IdentificacaoDoRelatorio } from "./IdentificacaoDoRelatorio";
import RelatorioSimulado from "./index";
import { TEXTO_COMPOSICOES_DIFERENTES } from "./RelatorioDoSimuladoConteudo";

/**
 * O relatório da PROVA (tickets/034, card 04): a mesma tela do relatório do
 * simulado, com a fonte da prova e uma linha por APLICAÇÃO.
 */
const buscarRelatorio = vi.hoisted(() => vi.fn());
const buscarQuestoes = vi.hoisted(() => vi.fn());
const buscarDetalheDoEstudante = vi.hoisted(() => vi.fn());

vi.mock("@/services/relatorioSimulado/buscarRelatorio", () => ({
  buscarRelatorio,
  caminhoDoRelatorio: vi.fn(),
}));
vi.mock("@/services/relatorioSimulado/buscarQuestoes", () => ({
  buscarQuestoes,
}));
vi.mock("@/services/relatorioSimulado/buscarDetalheDoEstudante", () => ({
  buscarDetalheDoEstudante,
}));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok", permissao: {} } }),
}));

const SIMULADOS = [
  { simuladoId: "s1", nome: "Inglês", cartoes: 1, totalDeQuestoes: 90 },
  { simuladoId: "s2", nome: "Espanhol", cartoes: 1, totalDeQuestoes: 90 },
];

const linha = (over: Partial<LinhaDoRelatorio> = {}): LinhaDoRelatorio => ({
  usuario: "u1",
  nome: "Ana Silva",
  matricula: "2025001",
  turmaId: "t-1",
  turmaNome: "Turma A",
  enviouCartao: true,
  status: "completed",
  aproveitamentoGeral: 0.8,
  simuladoId: "s1",
  ...over,
});

const resumo = (over: Partial<ResumoDoRelatorio> = {}): ResumoDoRelatorio => ({
  totalNoRecorte: 1,
  comLeituraConcluida: 2,
  aproveitamentoGeral: 0.7,
  totalEstudantesComCartaoNoCursinho: 1,
  linhasSemEstudanteAtivo: 0,
  totalDeQuestoes: 90,
  simuladoNome: "Prova do cursinho",
  turmaNome: null,
  ultimoCartaoEm: null,
  simulados: SIMULADOS,
  mesmasQuestoes: true,
  ...over,
});

const montar = (rota = "/relatorio-prova/p-1") =>
  render(
    <MemoryRouter initialEntries={[rota]}>
      <Routes>
        <Route
          path="/relatorio-prova/:provaId"
          element={<RelatorioSimulado tipo="prova" />}
        />
      </Routes>
    </MemoryRouter>,
  );

describe("rota relatorio-prova/:provaId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buscarQuestoes.mockResolvedValue({ questoes: [], mesmasQuestoes: true });
    buscarDetalheDoEstudante.mockResolvedValue({
      status: "completed",
      respostas: [],
    });
  });

  it("busca pela fonte da PROVA, e o título é o nome da prova", async () => {
    buscarRelatorio.mockResolvedValue({ linhas: [linha()], resumo: resumo() });
    montar("/relatorio-prova/p-1?turma=t-1");

    await waitFor(() =>
      expect(buscarRelatorio).toHaveBeenCalledWith(
        "tok",
        { tipo: "prova", provaId: "p-1" },
        "t-1",
      ),
    );
    expect(
      await screen.findByRole("heading", { name: "Prova do cursinho" }),
    ).toBeInTheDocument();
    expect(document.title).toBe("Relatório da prova");
  });

  it("⚠️ o mesmo estudante em dois simulados: duas linhas, com a coluna Simulado", async () => {
    buscarRelatorio.mockResolvedValue({
      linhas: [linha(), linha({ simuladoId: "s2", aproveitamentoGeral: 0.6 })],
      resumo: resumo(),
    });
    montar();

    expect(
      await screen.findByRole("columnheader", { name: /simulado/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Ana Silva")).toHaveLength(2);
    expect(screen.getByText("Inglês")).toBeInTheDocument();
    expect(screen.getByText("Espanhol")).toBeInTheDocument();
  });

  it("⚠️ o detalhe abre o simulado DA LINHA clicada", async () => {
    buscarRelatorio.mockResolvedValue({
      linhas: [linha(), linha({ simuladoId: "s2" })],
      resumo: resumo(),
    });
    montar();

    fireEvent.click(await screen.findByText("Espanhol"));

    await waitFor(() =>
      expect(buscarDetalheDoEstudante).toHaveBeenCalledWith("tok", "s2", "u1"),
    );
  });

  it("composições diferentes: o aviso aparece", async () => {
    buscarRelatorio.mockResolvedValue({
      linhas: [linha()],
      resumo: resumo({ mesmasQuestoes: false }),
    });
    montar();

    expect(
      await screen.findByText(TEXTO_COMPOSICOES_DIFERENTES),
    ).toBeInTheDocument();
  });

  it("mesmas questões: sem aviso", async () => {
    buscarRelatorio.mockResolvedValue({ linhas: [linha()], resumo: resumo() });
    montar();

    await screen.findByRole("heading", { name: "Prova do cursinho" });
    expect(screen.queryByText(TEXTO_COMPOSICOES_DIFERENTES)).toBeNull();
  });
});

describe("coluna Simulado", () => {
  const ids = (simulados?: typeof SIMULADOS) =>
    colunasDoRelatorio({ comTurma: false, simulados }).map((c) => c.id);

  it("só com MAIS DE UM simulado — senão seria coluna constante", () => {
    expect(ids(SIMULADOS)).toContain("simulado");
    expect(ids([SIMULADOS[0]])).not.toContain("simulado");
    expect(ids(undefined)).not.toContain("simulado");
  });

  it("entra também na planilha", () => {
    const p = planilhaDeEstudantes([linha({ simuladoId: "s2" })], {
      comTurma: true,
      simulados: SIMULADOS,
    });
    const i = p.cabecalho.indexOf("Simulado");
    expect(i).toBeGreaterThan(-1);
    expect(p.linhas[0][i]).toBe("Espanhol");
  });

  it("e fica fora da planilha do simulado", () => {
    const p = planilhaDeEstudantes([linha()], { comTurma: true });
    expect(p.cabecalho).not.toContain("Simulado");
  });
});

describe("identificação do relatório da prova", () => {
  it("diz de quantos simulados vêm os cartões", () => {
    render(<IdentificacaoDoRelatorio resumo={resumo()} comTitulo />);
    expect(screen.getByText(/2 simulados/)).toBeInTheDocument();
  });

  it("com um simulado só, não fala de simulados", () => {
    render(
      <IdentificacaoDoRelatorio
        resumo={resumo({ simulados: [SIMULADOS[0]] })}
        comTitulo
      />,
    );
    expect(screen.queryByText(/simulados/)).toBeNull();
  });
});
