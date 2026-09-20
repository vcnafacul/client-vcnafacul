import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

/**
 * ⚠️ O serviço do card `04b`. Dublê obrigatório: sem ele, um teste que ligasse
 * a ação de relatório sairia pela rede em vez de falhar numa asserção.
 */
const buscarSimuladosComCartao = vi.hoisted(() => vi.fn());
vi.mock("@/services/relatorioSimulado/buscarSimuladosComCartao", () => ({
  buscarSimuladosComCartao,
}));
vi.mock("react-toastify", () => ({
  toast: { loading: vi.fn(() => 1), update: vi.fn() },
}));
vi.mock("./editDisponibilidadeModal", () => ({
  default: () => <div data-testid="modal-janela" />,
}));

import SimuladosView, { type AcaoRelatorio } from "./simuladosView";

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

const montar = (simulados: SimuladoResumo[], relatorio?: AcaoRelatorio) =>
  render(
    <SimuladosView
      simulados={simulados}
      loading={false}
      error={null}
      token="tok"
      onVoltar={vi.fn()}
      onRetry={vi.fn()}
      onSimuladoUpdated={vi.fn()}
      relatorio={relatorio}
    />,
  );

beforeEach(() => {
  baixarCartao.mockClear();
  baixarCaderno.mockClear();
  buscarSimuladosComCartao.mockReset();
  buscarSimuladosComCartao.mockResolvedValue({
    simulados: [
      {
        simuladoId: "s1",
        nome: "ENEM 2025 — 1º dia",
        cartoes: 3,
        comLeituraConcluida: 2,
        ultimoEnvio: null,
      },
    ],
  });
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

/**
 * ⚠️ **Um `render` por teste, cada um verificando tudo o que der daquela
 * montagem.** Vale o mesmo aviso do bloco acima: o Popper do Radix é caro no
 * jsdom e o custo vaza entre testes.
 */
describe("SimuladosView — a ação de relatório", () => {
  it("⚠️ SEM a prop `relatorio`, a ação NÃO existe — é a tela do admin", async () => {
    // O `simuladosView` é compartilhado entre a `dashprovas` (admin) e a
    // `cursinho-provas`. Sem interruptor explícito a ação apareceria nas duas,
    // e na do admin — que pode não ter cursinho — a api devolveria 403.
    montar([simulado()]);

    /*
      ⚠️ A lista INTEIRA das ações, e não um `queryByRole` pelo rótulo
      "relatório". Desabilitada, a `AcaoIcone` troca o nome acessível pelo
      MOTIVO — e o motivo de "sem permissão" não contém a palavra "relatório".
      Uma busca pelo rótulo deixaria passar exatamente o vazamento que este
      teste existe para pegar: a ação presente na tela do admin, inerte.
    */
    const linha = screen.getAllByRole("row")[1];
    expect(
      within(linha)
        .getAllByRole("button")
        .map((b) => b.getAttribute("aria-label")),
    ).toEqual([
      "Baixar cartão de resposta",
      "Baixar caderno de questões (pacote .zip para abrir no Overleaf)",
      "Editar janela de disponibilidade",
    ]);

    // ⚠️ E o serviço do `04b` nem chega a ser chamado: um 403 no console sem
    // propósito nenhum.
    await waitFor(() =>
      expect(buscarSimuladosComCartao).not.toHaveBeenCalled(),
    );
  });

  it("com a prop, a ação aparece e chama o callback com o simulado", async () => {
    const aoAbrir = vi.fn();
    montar([simulado()], { aoAbrir, permitido: true });

    const botao = await screen.findByRole("button", {
      name: /relat[óo]rio/i,
    });
    expect(botao).not.toHaveAttribute("aria-disabled");

    fireEvent.click(botao);

    expect(aoAbrir).toHaveBeenCalledWith(
      expect.objectContaining({ _id: "s1" }),
    );
  });

  it("simulado sem cartão: ação desabilitada e o clique não passa", async () => {
    buscarSimuladosComCartao.mockResolvedValue({ simulados: [] });
    const aoAbrir = vi.fn();
    montar([simulado()], { aoAbrir, permitido: true });

    await waitFor(() => expect(buscarSimuladosComCartao).toHaveBeenCalled());
    const botao = await screen.findByRole("button", { name: /nenhum cart/i });

    fireEvent.click(botao);

    // ⚠️ `AcaoIcone` usa `aria-disabled`, não `disabled` — o clique CHEGA, e
    // quem barra é a guarda interna. Verificar só o atributo deixaria remover
    // a guarda sem nenhum teste vermelho.
    expect(botao).toHaveAttribute("aria-disabled", "true");
    expect(aoAbrir).not.toHaveBeenCalled();
  });

  it("⚠️ enquanto o `04b` não respondeu, a ação já nasce desabilitada", async () => {
    // Melhor desabilitada por um instante do que habilitada para abrir uma
    // tela vazia — a resposta ainda não chegou, ninguém sabe se há cartão.
    let liberar: (v: unknown) => void = () => {};
    buscarSimuladosComCartao.mockReturnValue(
      new Promise((resolve) => {
        liberar = resolve;
      }),
    );
    const aoAbrir = vi.fn();
    montar([simulado()], { aoAbrir, permitido: true });

    const botao = screen.getByRole("button", { name: /nenhum cart/i });
    fireEvent.click(botao);

    expect(botao).toHaveAttribute("aria-disabled", "true");
    expect(aoAbrir).not.toHaveBeenCalled();

    await waitFor(() => liberar({ simulados: [] }));
  });

  it("sem gerenciarEstudantes: desabilitada com motivo, e o 04b não é chamado", async () => {
    const aoAbrir = vi.fn();
    montar([simulado()], { aoAbrir, permitido: false });

    const botao = await screen.findByRole("button", { name: /permiss/i });
    fireEvent.click(botao);

    expect(botao).toHaveAttribute("aria-disabled", "true");
    expect(aoAbrir).not.toHaveBeenCalled();
    expect(buscarSimuladosComCartao).not.toHaveBeenCalled();
  });
});
