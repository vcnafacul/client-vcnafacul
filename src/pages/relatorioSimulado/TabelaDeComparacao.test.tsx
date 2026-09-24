import type { SimuladoComCartao } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  TabelaDeComparacao,
  TEXTO_ESCOLHA,
  TEXTO_SEM_INTERSECAO,
} from "./TabelaDeComparacao";

const buscarRelatorio = vi.hoisted(() => vi.fn());
vi.mock("@/services/relatorioSimulado/buscarRelatorio", () => ({
  buscarRelatorio,
  caminhoDoRelatorio: vi.fn(),
}));

const SIMULADOS: SimuladoComCartao[] = [
  {
    simuladoId: "novo",
    nome: "Segunda aplicação",
    cartoes: 3,
    comLeituraConcluida: 3,
    ultimoEnvio: "2026-06-01T00:00:00.000Z",
  },
  {
    simuladoId: "velho",
    nome: "Primeira aplicação",
    cartoes: 3,
    comLeituraConcluida: 3,
    ultimoEnvio: "2026-03-01T00:00:00.000Z",
  },
];

const linha = (nome: string, nota?: number) => ({
  usuario: `u-${nome}`,
  nome,
  matricula: `m-${nome}`,
  turmaId: null,
  turmaNome: null,
  enviouCartao: true,
  status: nota === undefined ? "awaiting_omr" : "completed",
  aproveitamentoGeral: nota,
});

const relatorio = (linhas: unknown[]) => ({ linhas, resumo: {} });

const montar = (simulados = SIMULADOS) =>
  render(<TabelaDeComparacao token="tok" simulados={simulados} />);

describe("TabelaDeComparacao (card 31)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buscarRelatorio.mockImplementation((_t: string, id: string) =>
      Promise.resolve(
        id === "velho"
          ? relatorio([linha("Ana", 0.5), linha("Bruno", 0.6)])
          : relatorio([linha("Ana", 0.62), linha("Bruno", 0.5)]),
      ),
    );
  });

  it("⚠️ a mais ANTIGA vem à esquerda por padrão", async () => {
    /*
      A lista chega ordenada por último envio (a mais recente primeiro).
      Inverter aqui é o que faz "melhorou" ser melhora — com a ordem trocada,
      toda subida viraria queda sem nada na tela denunciando.
    */
    const { container } = montar();

    await waitFor(() => expect(buscarRelatorio).toHaveBeenCalledTimes(2));
    expect(
      (container.querySelector("[data-seletor-antes]") as HTMLSelectElement)
        .value,
    ).toBe("velho");
    expect(
      (container.querySelector("[data-seletor-depois]") as HTMLSelectElement)
        .value,
    ).toBe("novo");
  });

  it("mostra a variação de cada aluno", async () => {
    const { container } = montar();

    await waitFor(() =>
      expect(container.querySelector("[data-delta='u-Ana']")).toHaveTextContent(
        "+12 p.p.",
      ),
    );
    expect(container.querySelector("[data-delta='u-Bruno']")).toHaveTextContent(
      "−10 p.p.",
    );
  });

  it("⚠️ a cor compara com a TURMA, não com zero", async () => {
    /*
      A turma caiu 1 p.p. (média 55% → 56%… na verdade +1). Ana subiu 12 (acima),
      Bruno caiu 10 (abaixo). Um aluno que cai MENOS que a turma sobe de posição
      — pintar de vermelho ali seria pedagogicamente errado.
    */
    const { container } = montar();

    await waitFor(() =>
      expect(container.querySelector("[data-delta='u-Ana']")).toHaveAttribute(
        "data-acima",
        "true",
      ),
    );
    expect(container.querySelector("[data-delta='u-Bruno']")).toHaveAttribute(
      "data-acima",
      "false",
    );
  });

  it("⚠️ a variação da TURMA aparece antes da tabela", async () => {
    // Sem saber que a turma caiu 10, "−7 p.p." se lê como queda.
    const { container } = montar();

    await waitFor(() =>
      expect(container.querySelector("[data-resumo]")).toBeTruthy(),
    );
    expect(container.querySelector("[data-resumo]")).toHaveTextContent(
      "a turma:",
    );
  });

  it("⚠️ quem fez só uma é CONTADO, nunca listado", async () => {
    buscarRelatorio.mockImplementation((_t: string, id: string) =>
      Promise.resolve(
        id === "velho"
          ? relatorio([linha("Ana", 0.5), linha("Carla", 0.4)])
          : relatorio([linha("Ana", 0.62)]),
      ),
    );

    const { container } = montar();

    await waitFor(() =>
      expect(container.querySelector("[data-fora]")).toBeTruthy(),
    );
    expect(container.querySelector("[data-fora]")).toHaveTextContent("1 ");
    // ⚠️ e o nome de quem ficou de fora NÃO aparece
    expect(screen.queryByText("Carla")).toBeNull();
  });

  it("⚠️ sem interseção diz por quê, em vez de tabela vazia", async () => {
    buscarRelatorio.mockImplementation((_t: string, id: string) =>
      Promise.resolve(
        id === "velho"
          ? relatorio([linha("Ana", 0.5)])
          : relatorio([linha("Bruno", 0.6)]),
      ),
    );

    montar();

    expect(await screen.findByText(TEXTO_SEM_INTERSECAO)).toBeTruthy();
  });

  it("⚠️ escolher a MESMA aplicação nos dois lados não busca nada", async () => {
    const { container } = montar();
    await waitFor(() => expect(buscarRelatorio).toHaveBeenCalledTimes(2));

    fireEvent.change(container.querySelector("[data-seletor-antes]")!, {
      target: { value: "novo" },
    });

    await waitFor(() =>
      expect(container.querySelector("[data-mesma-aplicacao]")).toBeTruthy(),
    );
    expect(screen.getByText(TEXTO_ESCOLHA)).toBeTruthy();
    // não disparou busca nova
    expect(buscarRelatorio).toHaveBeenCalledTimes(2);
  });

  it("trocar a aplicação refaz a comparação", async () => {
    const { container } = montar([
      ...SIMULADOS,
      {
        simuladoId: "terceiro",
        nome: "Terceira",
        cartoes: 1,
        comLeituraConcluida: 1,
        ultimoEnvio: "2026-01-01T00:00:00.000Z",
      },
    ]);
    await waitFor(() => expect(buscarRelatorio).toHaveBeenCalledTimes(2));

    fireEvent.change(container.querySelector("[data-seletor-antes]")!, {
      target: { value: "terceiro" },
    });

    await waitFor(() => expect(buscarRelatorio).toHaveBeenCalledTimes(4));
  });
});
