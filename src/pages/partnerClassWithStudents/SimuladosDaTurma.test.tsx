import { fireEvent } from "@testing-library/dom";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SimuladosDaTurma } from "./SimuladosDaTurma";

const buscarSimuladosComCartao = vi.hoisted(() => vi.fn());
vi.mock("@/services/relatorioSimulado/buscarSimuladosComCartao", () => ({
  buscarSimuladosComCartao,
}));

const navigate = vi.hoisted(() => vi.fn());
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

const simulado = (over = {}) => ({
  simuladoId: "sim-1",
  nome: "ENEM 2024 — 1º dia",
  cartoes: 12,
  comLeituraConcluida: 9,
  ultimoEnvio: "2026-05-02T00:00:00.000Z",
  ...over,
});

const montar = () =>
  render(
    <MemoryRouter>
      <SimuladosDaTurma token="tok" turmaId="t-1" />
    </MemoryRouter>,
  );

describe("SimuladosDaTurma", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buscarSimuladosComCartao.mockResolvedValue({ simulados: [simulado()] });
  });

  it("busca os simulados DA TURMA, não do cursinho", async () => {
    montar();

    await waitFor(() =>
      expect(buscarSimuladosComCartao).toHaveBeenCalledWith("tok", "t-1"),
    );
  });

  it("mostra nome, cartões e quantos entraram no cálculo", async () => {
    montar();

    expect(await screen.findByText("ENEM 2024 — 1º dia")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
  });

  it("⚠️ diz que o recorte é só cartão-resposta", async () => {
    // é aqui que a pessoa decide entrar; sem isto a primeira pergunta da
    // semana é "cadê o fulano que respondeu no computador?"
    montar();

    expect(await screen.findByText(/cart[ãa]o-resposta/i)).toBeInTheDocument();
  });

  it("clicar na linha leva ao relatório COM a turma aplicada", async () => {
    montar();
    fireEvent.click(await screen.findByText("ENEM 2024 — 1º dia"));

    expect(navigate).toHaveBeenCalledWith(
      expect.stringContaining("relatorio-simulado/sim-1?turma=t-1"),
    );
  });

  it("⚠️ simulado sem nome continua na lista e continua clicável", async () => {
    // o 04b devolve nome nulo quando o documento do Simulado sumiu. Os cartões
    // existem — escondê-los é o oposto do que este relatório serve para fazer,
    // e o relatório dele abre, porque as respostas vivem no histórico.
    buscarSimuladosComCartao.mockResolvedValue({
      simulados: [simulado({ nome: null, simuladoId: "sim-morto" })],
    });
    montar();

    const rotulo = await screen.findByText(/removido/i);
    fireEvent.click(rotulo);

    expect(navigate).toHaveBeenCalledWith(
      expect.stringContaining("relatorio-simulado/sim-morto?turma=t-1"),
    );
  });

  it("turma sem cartão mostra estado vazio explicativo", async () => {
    buscarSimuladosComCartao.mockResolvedValue({ simulados: [] });
    montar();

    expect(await screen.findByText(/nenhum simulado/i)).toBeInTheDocument();
  });

  it("erro é recuperável, não tela em branco", async () => {
    buscarSimuladosComCartao.mockRejectedValueOnce(new Error("caiu"));
    montar();

    const tentar = await screen.findByRole("button", {
      name: /tentar novamente/i,
    });
    buscarSimuladosComCartao.mockResolvedValue({ simulados: [simulado()] });
    fireEvent.click(tentar);

    expect(await screen.findByText("ENEM 2024 — 1º dia")).toBeInTheDocument();
  });
});
