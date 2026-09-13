import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SimuladoResumo } from "../../../dtos/prova/prova";

/* -------------------------------------------------------------------------- *
 * Mocks — o que está sob teste é a apresentação: quais colunas existem, o que
 * o ícone de status anuncia e quais ações ficam inertes. Serviços e o modal de
 * edição entram como dublês.
 * -------------------------------------------------------------------------- */

const baixarCartao = vi.hoisted(() => vi.fn(async () => new Blob()));
const baixarCaderno = vi.hoisted(() =>
  vi.fn(async () => ({ blob: new Blob(), avisos: 0 })),
);

vi.mock("../../../services/cartaoResposta/baixarCartao", () => ({
  baixarCartao,
}));
vi.mock("../../../services/caderno/baixarCaderno", () => ({ baixarCaderno }));
vi.mock("react-toastify", () => ({
  toast: { loading: vi.fn(() => 1), update: vi.fn() },
}));
vi.mock("./editDisponibilidadeModal", () => ({
  default: () => <div data-testid="modal-janela" />,
}));

import SimuladosView from "./simuladosView";

/**
 * ⚠️ Data montada em horário LOCAL. Ver o mesmo aviso em
 * `simuladoStatus.test.ts`: ISO fixo tornaria o teste dependente do `TZ`.
 */
const iso = (ano: number, mes: number, dia: number, hora = 0) =>
  new Date(ano, mes - 1, dia, hora).toISOString();

const simulado = (over: Partial<SimuladoResumo> = {}): SimuladoResumo =>
  ({
    _id: "s1",
    nome: "ENEM 2025 — 1º dia",
    categoria: { nome: "Linguagens", quantidadeTotalQuestao: 45 },
    questoes: Array.from({ length: 12 }, (_, i) => ({ _id: `q${i}` })),
    bloqueado: false,
    ...over,
  }) as SimuladoResumo;

const montar = (simulados: SimuladoResumo[]) =>
  render(
    <SimuladosView
      simulados={simulados}
      loading={false}
      error={null}
      token="tok"
      onVoltar={vi.fn()}
      onRetry={vi.fn()}
      onSimuladoUpdated={vi.fn()}
    />,
  );

beforeEach(() => {
  baixarCartao.mockClear();
  baixarCaderno.mockClear();
});

/**
 * ⚠️ **Nenhum teste aqui abre um tooltip, e isso é deliberado.** Montar o
 * Popper do Radix degrada o jsdom de forma progressiva — é o que faz o
 * `DashToolbar.test.tsx` levar ~38s e ficar fora do CI. O conteúdo do tooltip
 * é o mesmo texto do `aria-label`, que dá para conferir sem abrir nada, e a
 * regra que o produz está coberta em `simuladoStatus.test.ts`.
 */
describe("SimuladosView", () => {
  it("não tem mais as colunas de data", () => {
    montar([simulado()]);

    expect(screen.queryByText("Disponível de")).not.toBeInTheDocument();
    expect(screen.queryByText("Disponível até")).not.toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Simulado" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Questões" }),
    ).toBeInTheDocument();
  });

  it("a coluna de status tem cabeçalho acessível mesmo sem rótulo visível", () => {
    // ⚠️ A coluna tem 40px e nada escrito. Sem o `sr-only`, quem usa leitor de
    // tela ouve uma coluna sem nome.
    montar([simulado()]);

    expect(
      screen.getByRole("columnheader", { name: "Status" }),
    ).toBeInTheDocument();
  });

  it("o status é ícone e a janela vira o nome acessível dele", () => {
    montar([
      simulado({
        disponivelDe: iso(2020, 1, 10, 9),
        disponivelAte: iso(2090, 2, 20, 18),
      }),
    ]);

    const icone = screen.getByRole("img", {
      name: "Disponível de 10/01/2020 09:00 até 20/02/2090 18:00",
    });
    expect(icone).toHaveAttribute("data-forma", "check");
    expect(icone).toHaveAttribute("data-tone", "done");

    // ⚠️ O par do teste: o texto não pode ter voltado para a célula. É o que
    // separa "virou ícone" de "ganhou um ícone ao lado do texto".
    const linha = screen.getAllByRole("row")[1];
    expect(linha).not.toHaveTextContent("Disponível de");
  });

  it("o ícone de status é alcançável por teclado", () => {
    // ⚠️ Sem `tabIndex`, o tooltip só existe para quem tem mouse — e como não
    // há texto na tela, o status ficaria inacessível ao teclado.
    montar([simulado()]);

    expect(screen.getByRole("img")).toHaveAttribute("tabindex", "0");
  });

  it("bloqueado deixa cartão e caderno inertes, dizendo o motivo", () => {
    montar([simulado({ bloqueado: true })]);

    const cartao = screen.getByRole("button", { name: /Cartão de resposta/ });
    expect(cartao).toHaveAttribute("aria-disabled", "true");
    expect(cartao).toHaveAccessibleName(/cadastradas, aprovadas e numeradas/);

    // ⚠️ `aria-disabled` não impede o clique — quem impede é a guarda no
    // `onClick`. Sem esta asserção, remover a guarda passaria despercebido e a
    // ação bloqueada voltaria a disparar.
    fireEvent.click(cartao);
    expect(baixarCartao).not.toHaveBeenCalled();
  });

  it("o botão inerte continua focável, senão o motivo não chega a ninguém", () => {
    // ⚠️ A razão de usar `aria-disabled` em vez de `disabled`: botão nativo
    // desabilitado não recebe foco nem hover, e o tooltip nunca abre.
    montar([simulado({ bloqueado: true })]);

    const cartao = screen.getByRole("button", { name: /Cartão de resposta/ });
    expect(cartao).not.toBeDisabled();
    cartao.focus();
    expect(cartao).toHaveFocus();
  });

  it("simulado pronto baixa o cartão e oferece o caderno", () => {
    montar([simulado()]);

    fireEvent.click(
      screen.getByRole("button", { name: /cartão de resposta/i }),
    );
    expect(baixarCartao).toHaveBeenCalledWith("s1", "tok");

    expect(
      screen.getByRole("button", { name: /caderno de questões/i }),
    ).toBeInTheDocument();
  });

  it("categoria aparece junto do nome, não em coluna própria", () => {
    montar([simulado()]);

    const linha = screen.getAllByRole("row")[1];
    const celulas = within(linha).getAllByRole("cell");
    expect(celulas).toHaveLength(4);
    expect(celulas[1]).toHaveTextContent("ENEM 2025 — 1º dia");
    expect(celulas[1]).toHaveTextContent("Linguagens");
  });

  it("mostra a proporção de questões", () => {
    montar([simulado()]);

    expect(screen.getByText("12/45")).toBeInTheDocument();
    expect(screen.getByTestId("barra-questoes")).toHaveStyle({
      width: `${(12 / 45) * 100}%`,
    });
  });
});
