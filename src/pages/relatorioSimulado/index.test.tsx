import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RelatorioSimulado from "./index";

const buscarRelatorio = vi.hoisted(() => vi.fn());
const buscarQuestoes = vi.hoisted(() => vi.fn());
vi.mock("@/services/relatorioSimulado/buscarRelatorio", () => ({
  buscarRelatorio,
  caminhoDoRelatorio: vi.fn(),
}));
vi.mock("@/services/relatorioSimulado/buscarQuestoes", () => ({ buscarQuestoes }));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));

const RESPOSTA = {
  linhas: [
    {
      usuario: "u1",
      nome: "Ana Silva",
      matricula: "2025001",
      turmaId: "t-1",
      turmaNome: "Turma A",
      enviouCartao: true,
      status: "completed",
      aproveitamentoGeral: 0.8,
      questoesRespondidas: 90,
    },
  ],
  resumo: {
    totalNoRecorte: 1,
    comLeituraConcluida: 1,
    aproveitamentoGeral: 0.8,
    totalEstudantesComCartaoNoCursinho: 1,
    temEstudanteSemTurma: false,
    linhasSemEstudanteAtivo: 0,
  },
};

/**
 * ⚠️ `mouseDown`, não `click`, e sem `user-event`: o pacote não existe neste
 * repo (só `@testing-library/react`), e o `TabsTrigger` do Radix troca de aba
 * no `onMouseDown` — um `fireEvent.click` não dispara mousedown e a aba não
 * muda, o que faria o teste passar por não ter acontecido nada.
 */
const abrirAba = (nome: RegExp) =>
  fireEvent.mouseDown(screen.getByRole("tab", { name: nome }));

const montar = (rota = "/relatorio-simulado/sim-1") =>
  render(
    <MemoryRouter initialEntries={[rota]}>
      <Routes>
        <Route path="/relatorio-simulado/:simuladoId" element={<RelatorioSimulado />} />
      </Routes>
    </MemoryRouter>,
  );

describe("RelatorioSimulado", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buscarRelatorio.mockResolvedValue(RESPOSTA);
    buscarQuestoes.mockResolvedValue({ questoes: [] });
  });

  it("busca o relatório do simulado da URL", async () => {
    montar();

    await waitFor(() =>
      expect(buscarRelatorio).toHaveBeenCalledWith("tok", "sim-1", undefined),
    );
    expect(await screen.findByText("Ana Silva")).toBeInTheDocument();
  });

  it("?turma= restringe o recorte", async () => {
    montar("/relatorio-simulado/sim-1?turma=t-9");

    await waitFor(() =>
      expect(buscarRelatorio).toHaveBeenCalledWith("tok", "sim-1", "t-9"),
    );
  });

  it("⚠️ NÃO busca as questões junto — só na primeira abertura da aba", async () => {
    montar();

    await screen.findByText("Ana Silva");
    expect(buscarQuestoes).not.toHaveBeenCalled();

    abrirAba(/quest/i);

    await waitFor(() => expect(buscarQuestoes).toHaveBeenCalledTimes(1));
  });

  it("voltar para a aba de estudantes e de novo para questões não rebusca", async () => {
    montar();
    await screen.findByText("Ana Silva");

    abrirAba(/quest/i);
    await waitFor(() => expect(buscarQuestoes).toHaveBeenCalledTimes(1));
    abrirAba(/estudante/i);
    abrirAba(/quest/i);

    expect(buscarQuestoes).toHaveBeenCalledTimes(1);
  });

  it("erro na busca mostra estado de erro, não tela em branco", async () => {
    buscarRelatorio.mockRejectedValue(new Error("caiu"));

    montar();

    expect(await screen.findByText(/erro/i)).toBeInTheDocument();
  });

  /**
   * ⚠️ O erro só vale se der para sair dele. Um estado de erro sem volta é a
   * mesma tela em branco com outra roupa.
   */
  it("o erro é recuperável — tentar de novo rebusca e mostra as linhas", async () => {
    buscarRelatorio.mockRejectedValueOnce(new Error("caiu"));

    montar();
    await screen.findByText(/erro/i);

    fireEvent.click(screen.getByRole("button", { name: /tentar novamente/i }));

    expect(await screen.findByText("Ana Silva")).toBeInTheDocument();
    expect(buscarRelatorio).toHaveBeenCalledTimes(2);
  });
});
