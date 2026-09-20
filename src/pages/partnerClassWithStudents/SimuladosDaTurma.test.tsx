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

/** Clica no cabeçalho ordenável da coluna — o botão, não o `<th>`. */
function ordenarPor(colunaId: string) {
  fireEvent.click(document.querySelector(`[data-sort-id="${colunaId}"]`)!);
}

/** A ordem em que as linhas saíram pintadas, pela chave de cada `<tr>`. */
function chavesDasLinhas(): string[] {
  return [...document.querySelectorAll("[data-row-key]")].map(
    (el) => el.getAttribute("data-row-key") ?? "",
  );
}

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

    // ⚠️ este teste fala da URL; o `state` tem teste próprio logo abaixo
    expect(navigate).toHaveBeenCalledWith(
      expect.stringContaining("relatorio-simulado/sim-1?turma=t-1"),
      expect.anything(),
    );
  });

  it("⚠️ leva o caminho de volta no state, senão o relatório devolve à listagem de provas", async () => {
    montar();
    fireEvent.click(await screen.findByText("ENEM 2024 — 1º dia"));

    expect(navigate).toHaveBeenCalledWith(
      expect.stringContaining("relatorio-simulado/sim-1?turma=t-1"),
      { state: { de: { caminho: `/dashboard/turmas/t-1` } } },
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
      { state: { de: { caminho: `/dashboard/turmas/t-1` } } },
    );
  });

  /**
   * ⚠️ **A ordenação inteira estava sem teste** — e nove mutações sobreviviam
   * aqui: inverter `cartoes`, zerar o `sortValue` de qualquer coluna, trocar a
   * direção inicial para `asc`, tirar a ordenação inicial e até desviar o
   * `sortRows`.
   *
   * O contrato é um só: **mais recente primeiro, e quem não tem data usável
   * fica no fim** — "não tem data" incluindo a data que não dá para ler, que é
   * exatamente onde o `new Date("lixo")` cru colocava a linha do "—" em
   * PRIMEIRO lugar.
   */
  it("⚠️ abre com o envio mais recente primeiro, e sem data usável vai pro fim", async () => {
    buscarSimuladosComCartao.mockResolvedValue({
      simulados: [
        simulado({ simuladoId: "sem-data", ultimoEnvio: null }),
        simulado({ simuladoId: "antigo", ultimoEnvio: "2026-01-10T00:00:00.000Z" }),
        simulado({ simuladoId: "lixo", ultimoEnvio: "data-invalida" }),
        simulado({ simuladoId: "recente", ultimoEnvio: "2026-07-20T00:00:00.000Z" }),
      ],
    });
    montar();

    await waitFor(() => expect(chavesDasLinhas()).toHaveLength(4));
    expect(chavesDasLinhas()).toEqual(["recente", "antigo", "sem-data", "lixo"]);
  });

  /**
   * ⚠️ O par do teste acima: lá a ordenação inicial, aqui as colunas que só
   * ordenam por clique. Sem isto, zerar o `sortValue` de `cartoes`, `lidos` ou
   * `nome` — ou invertê-lo — não deixa nada vermelho, porque a lista continua
   * na ordem que a inicial deu.
   */
  it("⚠️ clicar no cabeçalho ordena por aquela coluna", async () => {
    buscarSimuladosComCartao.mockResolvedValue({
      simulados: [
        simulado({ simuladoId: "meio", nome: "B", cartoes: 5, comLeituraConcluida: 2 }),
        simulado({ simuladoId: "muitos", nome: "A", cartoes: 9, comLeituraConcluida: 1 }),
        simulado({ simuladoId: "poucos", nome: "C", cartoes: 1, comLeituraConcluida: 3 }),
      ],
    });
    montar();
    await waitFor(() => expect(chavesDasLinhas()).toHaveLength(3));

    ordenarPor("cartoes"); // asc: 1, 5, 9
    expect(chavesDasLinhas()).toEqual(["poucos", "meio", "muitos"]);

    ordenarPor("lidos"); // asc: 1, 2, 3
    expect(chavesDasLinhas()).toEqual(["muitos", "meio", "poucos"]);

    ordenarPor("nome"); // asc: A, B, C
    expect(chavesDasLinhas()).toEqual(["muitos", "meio", "poucos"]);

    ordenarPor("nome"); // desc: C, B, A
    expect(chavesDasLinhas()).toEqual(["poucos", "meio", "muitos"]);
  });

  it("⚠️ a chave da linha é o id, não o nome — dois simulados removidos são duas linhas", async () => {
    buscarSimuladosComCartao.mockResolvedValue({
      simulados: [
        simulado({ simuladoId: "morto-1", nome: null }),
        simulado({ simuladoId: "morto-2", nome: null }),
      ],
    });
    montar();

    await waitFor(() => expect(chavesDasLinhas()).toHaveLength(2));
    expect(new Set(chavesDasLinhas()).size).toBe(2);
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
