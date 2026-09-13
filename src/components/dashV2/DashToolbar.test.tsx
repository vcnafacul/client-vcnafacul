import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { DashToolbar, MAX_SECUNDARIAS_NA_BARRA } from "./DashToolbar";
import { dashV2 } from "./tokens";
import type { DashAction } from "./types";

beforeAll(() => {
  // O Popper do Radix observa o tamanho do gatilho; o jsdom não tem
  // ResizeObserver.
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

/**
 * ⚠️ O `sm` deste projeto é 768px — não o default do Tailwind. E o jsdom não
 * implementa `matchMedia`, então sem este mock o componente cai no palpite
 * "desktop" e o teste de mobile não testaria nada.
 */
function larguraDeTela(acimaDeSm: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      media: query,
      matches: query === "(min-width: 768px)" ? acimaDeSm : !acimaDeSm,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  larguraDeTela(true);
});
afterEach(() => vi.useRealTimers());

function acao(id: string, extra: Partial<DashAction> = {}): DashAction {
  return { id, label: id, onClick: vi.fn(), ...extra };
}

/**
 * ⚠️ Cada abertura de popover/tooltip custa segundos neste jsdom (o
 * posicionamento do Radix entra em loop de CPU — ver nota no fim do arquivo),
 * então os testes que abrem o `⋯` são poucos e cada um verifica tudo o que
 * precisa de uma abertura só.
 */
function abrirMenu() {
  fireEvent.click(screen.getByRole("button", { name: "Mais ações" }));
  act(() => void vi.advanceTimersByTime(10));
  return screen.getByRole("dialog");
}

const nomesNoMenu = (menu: HTMLElement) =>
  within(menu)
    .getAllByRole("button")
    .map((b) => b.textContent);

/** Nome acessível de cada botão da barra, na ordem do DOM. */
const naBarra = () =>
  within(screen.getByTestId("dash-toolbar"))
    .getAllByRole("button")
    .map((b) => b.getAttribute("aria-label") ?? b.textContent);

describe("DashToolbar — hierarquia", () => {
  it("a primária é o último botão da linha, depois das secundárias e do ⋯", () => {
    render(
      <DashToolbar
        title="Provas"
        primary={acao("Nova prova")}
        secondary={[acao("Importar"), acao("Exportar")]}
        overflow={[acao("Arquivar")]}
      />,
    );

    expect(naBarra()).toEqual(["Mais ações", "Importar", "Exportar", "Nova prova"]);
  });

  it("renderiza no máximo um botão laranja preenchido", () => {
    // ⚠️ Espalhado em cinco botões, o laranja deixa de apontar para lugar nenhum.
    const { container } = render(
      <DashToolbar
        title="Provas"
        primary={acao("Nova prova")}
        secondary={[acao("a"), acao("b"), acao("c")]}
        overflow={[acao("d")]}
      />,
    );

    const laranjas = [...container.querySelectorAll("button")].filter((b) =>
      b.className.split(/\s+/).includes("bg-orange"),
    );
    expect(laranjas).toHaveLength(1);
    expect(laranjas[0].textContent).toBe("Nova prova");
    expect(laranjas[0].className).toContain("text-marine");
  });

  it("título e subtítulo, com o subtítulo em darkGrey", () => {
    render(<DashToolbar title="Provas" subtitle="128 provas" />);
    expect(screen.getByRole("heading", { name: "Provas" })).toBeInTheDocument();
    expect(screen.getByText("128 provas").className).toContain(dashV2.text.secondary);
  });

  it("renderiza o backButton que a tela passar", () => {
    render(<DashToolbar title="Provas" backButton={<a href="/x">voltar</a>} />);
    expect(screen.getByRole("link", { name: "voltar" })).toBeInTheDocument();
  });

  it("sem nada para o menu, o ⋯ não existe", () => {
    render(<DashToolbar title="Provas" primary={acao("Nova")} secondary={[acao("a")]} />);
    expect(screen.queryByRole("button", { name: "Mais ações" })).toBeNull();
  });

  it("o gatilho do ⋯ tem nome acessível", () => {
    render(<DashToolbar title="Provas" overflow={[acao("Arquivar")]} />);
    expect(screen.getByRole("button", { name: "Mais ações" })).toBeInTheDocument();
  });
});

describe("DashToolbar — colapso automático", () => {
  it("com 5 secundárias, as duas últimas vão para o ⋯ sozinhas", () => {
    // ⚠️ É esta regra que impede a barra de voltar a ter seis botões em um ano.
    render(
      <DashToolbar
        title="Provas"
        primary={acao("Nova prova")}
        secondary={[acao("um"), acao("dois"), acao("três"), acao("quatro"), acao("cinco")]}
      />,
    );

    expect(naBarra()).toEqual(["Mais ações", "um", "dois", "três", "Nova prova"]);
    expect(nomesNoMenu(abrirMenu())).toEqual(["quatro", "cinco"]);
  });

  it("o limite é 3, e mora no componente — não nas telas", () => {
    expect(MAX_SECUNDARIAS_NA_BARRA).toBe(3);
  });

  it("com 3 secundárias ou menos, nada colapsa e o ⋯ nem aparece", () => {
    render(<DashToolbar title="Provas" secondary={[acao("um"), acao("dois"), acao("três")]} />);
    expect(naBarra()).toEqual(["um", "dois", "três"]);
  });

  it("no ⋯, as excedentes vêm antes das que já eram de overflow, e clicar dispara a ação", () => {
    const quatro = acao("quatro");
    render(
      <DashToolbar
        title="Provas"
        secondary={[acao("um"), acao("dois"), acao("três"), quatro]}
        overflow={[acao("arquivar"), acao("excluir", { destructive: true })]}
      />,
    );

    const menu = abrirMenu();
    expect(nomesNoMenu(menu)).toEqual(["quatro", "arquivar", "excluir"]);

    fireEvent.click(within(menu).getByRole("button", { name: "quatro" }));
    expect(quatro.onClick).toHaveBeenCalledTimes(1);

    // ⚠️ Os itens do menu usam os papéis do `02` (`menuItem` e
    // `destructiveGhost`), não cor escrita à mão aqui dentro — a catraca de
    // paleta do `tokens.test.ts` só guarda o arquivo de tokens.
    expect(within(menu).getByRole("button", { name: "arquivar" }).className).toContain(
      dashV2.action.menuItem,
    );
    const destrutivo = within(menu).getByRole("button", { name: "excluir" });
    expect(destrutivo.className).toContain(dashV2.action.destructiveGhost);
    expect(destrutivo.className.split(/\s+/)).not.toContain("bg-red");
  });
});

describe("DashToolbar — abaixo de 768px", () => {
  beforeEach(() => larguraDeTela(false));

  it("só a primária fica na barra; todas as secundárias estão no ⋯", () => {
    render(
      <DashToolbar
        title="Provas"
        primary={acao("Nova prova")}
        secondary={[acao("um"), acao("dois")]}
      />,
    );

    expect(naBarra()).toEqual(["Mais ações", "Nova prova"]);
    expect(nomesNoMenu(abrirMenu())).toEqual(["um", "dois"]);
  });

  it("uma única secundária também sai da barra", () => {
    render(<DashToolbar title="Provas" secondary={[acao("Importar")]} />);
    expect(naBarra()).toEqual(["Mais ações"]);
  });
});

describe("DashToolbar — motivo do botão desabilitado", () => {
  const desabilitada = () =>
    acao("Nova prova", {
      disabled: true,
      disabledReason: "Requer permissão: cadastrar provas",
    });

  it("o tooltip aparece no hover", () => {
    // ⚠️ Botão nativo desabilitado não dispara evento de mouse: quem recebe o
    // hover é o <span> em volta dele.
    render(<DashToolbar title="Provas" primary={desabilitada()} />);

    const gatilho = screen.getByRole("button", { name: "Nova prova" }).parentElement!;
    act(() => {
      fireEvent.pointerMove(gatilho, { pointerType: "mouse" });
      vi.advanceTimersByTime(300);
    });

    expect(screen.getAllByText("Requer permissão: cadastrar provas").length).toBeGreaterThan(0);
  });

  it("o tooltip aparece no foco por teclado", () => {
    // ⚠️ E botão desabilitado também não recebe foco — sem o <span> com
    // tabIndex, quem navega por Tab nunca chega no motivo.
    render(<DashToolbar title="Provas" primary={desabilitada()} />);

    const gatilho = screen.getByRole("button", { name: "Nova prova" }).parentElement!;
    act(() => {
      gatilho.focus();
      vi.advanceTimersByTime(300);
    });

    expect(document.activeElement).toBe(gatilho);
    expect(screen.getAllByText("Requer permissão: cadastrar provas").length).toBeGreaterThan(0);
  });

  it("sem interação, o motivo não está na tela", () => {
    render(<DashToolbar title="Provas" primary={desabilitada()} />);
    expect(screen.queryByText("Requer permissão: cadastrar provas")).toBeNull();
  });

  it("botão desabilitado sem motivo não ganha embrulho focável nem tooltip", () => {
    render(<DashToolbar title="Provas" primary={acao("Nova prova", { disabled: true })} />);
    const botao = screen.getByRole("button", { name: "Nova prova" });

    act(() => {
      fireEvent.pointerMove(botao.parentElement!, { pointerType: "mouse" });
      vi.advanceTimersByTime(300);
    });

    expect(botao.parentElement!.getAttribute("tabindex")).toBeNull();
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});

describe("DashToolbar — comportamento dos botões", () => {
  it("clique chama o onClick da ação", () => {
    const nova = acao("Nova prova");
    const importar = acao("Importar");
    render(<DashToolbar title="Provas" primary={nova} secondary={[importar]} />);

    fireEvent.click(screen.getByRole("button", { name: "Nova prova" }));
    fireEvent.click(screen.getByRole("button", { name: "Importar" }));

    expect(nova.onClick).toHaveBeenCalledTimes(1);
    expect(importar.onClick).toHaveBeenCalledTimes(1);
  });

  it("desabilitada não chama o onClick", () => {
    const nova = acao("Nova prova", { disabled: true, disabledReason: "Sem permissão" });
    render(<DashToolbar title="Provas" primary={nova} />);

    fireEvent.click(screen.getByRole("button", { name: "Nova prova" }));

    expect(nova.onClick).not.toHaveBeenCalled();
  });

  it("destrutiva não usa o laranja da ação principal", () => {
    render(<DashToolbar title="Provas" secondary={[acao("Excluir", { destructive: true })]} />);
    const botao = screen.getByRole("button", { name: "Excluir" });

    expect(botao.className).toContain(dashV2.action.destructive);
    expect(botao.className.split(/\s+/)).not.toContain("bg-orange");
  });

  it("o ícone é opcional e, quando vem, é decorativo", () => {
    // A hierarquia da barra é por cor e posição; o ícone não carrega
    // significado sozinho.
    render(
      <DashToolbar
        title="Provas"
        primary={acao("Nova prova", { icon: <svg data-testid="icone" /> })}
        secondary={[acao("Importar")]}
      />,
    );

    expect(screen.getByTestId("icone").parentElement!.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByRole("button", { name: "Importar" }).querySelector("svg")).toBeNull();
  });
});

describe("DashToolbar — acessibilidade", () => {
  it("todo elemento focável usa o anel laranja e nenhum anel azul sobra", () => {
    const { container } = render(
      <DashToolbar
        title="Provas"
        primary={acao("Nova prova")}
        secondary={[acao("Importar")]}
        overflow={[acao("Arquivar")]}
      />,
    );

    const focaveis = [...container.querySelectorAll("button, [tabindex='0']")];
    expect(focaveis.length).toBeGreaterThan(0);
    for (const el of focaveis) {
      expect(el.className, el.textContent ?? "").toContain("focus-visible:ring-orange/40");
      expect(el.className).not.toMatch(/ring-blue|focus:ring-blue|outline-blue/);
    }
  });

  it("o ⋯ não finge semântica de menu que o teclado não entrega", () => {
    // ⚠️ São botões dentro de um popover, navegáveis por Tab. `role="menu"` sem
    // navegação por setas é ARIA que promete o que não cumpre.
    render(<DashToolbar title="Provas" overflow={[acao("Arquivar"), acao("Excluir")]} />);
    const menu = abrirMenu();

    expect(menu.querySelector("[role='menu']")).toBeNull();
    expect(menu.querySelector("[role='menuitem']")).toBeNull();
    expect(within(menu).getAllByRole("button")).toHaveLength(2);
  });
});

/**
 * ⚠️ **Por que este arquivo é lento.** Cada montagem de conteúdo do Radix que
 * usa o Popper (o popover do `⋯` e o tooltip) custa ~3s **de CPU** neste jsdom:
 * o posicionamento do floating-ui não converge com os rects zerados do jsdom e
 * fica girando. Medido com `process.cpuUsage()` — é CPU, não espera. Nada a ver
 * com o componente; um `<Popper.Root>` pelado reproduz. Por isso os testes que
 * abrem o `⋯` são 4, e não um por asserção.
 */
