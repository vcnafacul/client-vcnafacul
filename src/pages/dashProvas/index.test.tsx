import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  TEXTO_VAZIO_COM_FILTRO,
  TEXTO_VAZIO_SEM_FILTRO,
} from "@/components/dashV2";
import type { Prova } from "../../dtos/prova/prova";
import { Edicao } from "../../enums/prova/edicao";
import { Roles } from "../../enums/roles/roles";

/* -------------------------------------------------------------------------- *
 * Mocks — a lógica de dados desta tela não muda com o ticket, então os serviços
 * e os modais entram como dublês. O que está sob teste é a camada de
 * apresentação: colunas, hierarquia de ações, filtros e o clique da linha.
 * -------------------------------------------------------------------------- */

const estado = vi.hoisted(() => ({
  provas: [] as unknown[],
  permissao: {} as Record<string, boolean>,
}));

vi.mock("../../store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok", permissao: estado.permissao } }),
}));

vi.mock("../../services/prova/getProvas", () => ({
  getProvas: vi.fn(async () => ({ data: estado.provas })),
}));
vi.mock("../../services/categoria/getCategorias", () => ({
  getCategorias: vi.fn(async () => ({ data: [] })),
}));
vi.mock("../../services/prova/startSync", () => ({ startSync: vi.fn() }));
vi.mock("../../services/prova/getSyncReport", () => ({
  getSyncReport: vi.fn(),
}));
vi.mock("./utils/syncReportPdf", () => ({ downloadSyncReportPdf: vi.fn() }));
vi.mock("../../hooks/useToastAsync", () => ({ useToastAsync: () => vi.fn() }));
vi.mock("react-toastify", () => ({
  toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}));

vi.mock("./modals/newProva", () => ({
  default: () => <div data-testid="modal-nova-prova" />,
}));
/**
 * ⚠️ O dublê imprime o **nome da prova recebida**. É o que torna verificável o
 * critério "clicar na linha abre o `ShowProva` da mesma prova que o card
 * abria": um `id` errado em `cardTransformation` faz o `provas.find` devolver
 * `undefined`, o modal abre vazio e este teste fica vermelho — em vez de a tela
 * abrir a prova errada em silêncio, que é o que acontece hoje sem teste.
 */
/**
 * ⚠️ O dublê guarda as props: é como se prova que esta tela **não** liga a ação
 * de relatório do cartão-resposta. Ver o par em `partnerPrepProvas`.
 */
const propsDoShowProva = vi.hoisted(
  () => ({ atual: null }) as { atual: Record<string, unknown> | null },
);
vi.mock("./modals/showProva", () => ({
  default: (props: { prova?: Prova | null }) => {
    propsDoShowProva.atual = props as Record<string, unknown>;
    return <div data-testid="show-prova">{props.prova?.nome ?? "SEM PROVA"}</div>;
  },
}));
vi.mock("./modals/manageCategorias", () => ({
  default: () => <div data-testid="modal-categorias" />,
}));
vi.mock("./modals/manageTemplate", () => ({
  default: () => <div data-testid="modal-template" />,
}));
vi.mock("./modals/uploadCartaoModal", () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="modal-cartao" /> : null,
}));

import DashProva from "./index";

/** O `sm` do projeto é 768px e o jsdom não implementa `matchMedia`. */
function telaDesktop() {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      media: query,
      matches: query === "(min-width: 768px)",
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

function prova(over: Partial<Prova> & { _id: string; nome: string }): Prova {
  return {
    edicao: Edicao.Regular,
    aplicacao: 1,
    ano: 2019,
    categoria: "ENEM",
    exame: "ENEM",
    totalQuestao: 180,
    totalQuestaoCadastradas: 180,
    totalQuestaoValidadas: 180,
    createdAt: "2024-03-10T12:00:00.000Z" as unknown as Prova["createdAt"],
    filename: "prova.pdf",
    gabarito: "gabarito.pdf",
    enemAreas: [],
    ...over,
  };
}

const PROVAS: Prova[] = [
  prova({ _id: "a", nome: "ENEM 2019 Regular", ano: 2019 }),
  prova({
    _id: "b",
    nome: "ENEM 2019 Reaplicação",
    ano: 2019,
    edicao: Edicao.Reaplicacao,
    gabarito: "",
    totalQuestaoCadastradas: 120,
    totalQuestaoValidadas: 90,
  }),
  prova({
    _id: "c",
    nome: "ENEM 2023 Digital",
    ano: 2023,
    edicao: Edicao.Digital,
    totalQuestao: 0,
    totalQuestaoCadastradas: 0,
    totalQuestaoValidadas: 0,
  }),
];

const TODAS_AS_PERMISSOES: Record<string, boolean> = {
  [Roles.cadastrarProvas]: true,
  [Roles.visualizarProvas]: true,
  [Roles.visualizarEstudantes]: true,
  [Roles.alterarPermissao]: true,
};

async function montar() {
  const utils = render(<DashProva />);
  // ⚠️ Dois flushes: `getProvas` e `getCategorias` resolvem em microtasks
  // separadas. Sem isso a tabela é assertada antes de receber as linhas.
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  return utils;
}

/** As linhas, na ordem em que a tabela as desenha. */
function chavesDasLinhas(): string[] {
  return [...document.querySelectorAll("[data-row-key]")].map(
    (el) => el.getAttribute("data-row-key") ?? "",
  );
}

/**
 * `true` só quando a classe exata está presente.
 *
 * ⚠️ `getAttribute("class")`, e não `el.className`: em `<svg>` o `className` é
 * um `SVGAnimatedString` e não tem `split` — e a tabela tem ícones de ordenação.
 *
 * ⚠️ Comparação por token exato: `bg-orange/10` (o chip do `StatusBadge`) e
 * `bg-darkOrange/40` (a faixa do progresso) **não** são o laranja de ação, e um
 * `includes("bg-orange")` os contaria.
 */
function temClasse(el: Element, classe: string): boolean {
  return (el.getAttribute("class") ?? "").split(/\s+/).includes(classe);
}

afterEach(() => vi.useRealTimers());

beforeEach(() => {
  telaDesktop();
  estado.provas = PROVAS;
  estado.permissao = { ...TODAS_AS_PERMISSOES };
});

describe("dashProvas em tabela densa", () => {
  it("lista as provas em tabela, ordenadas por ano decrescente", async () => {
    await montar();
    // ⚠️ `ano desc` é a ordenação padrão do ticket: 2023 antes das duas de 2019,
    // e o empate mantém a ordem original (sortRows é estável).
    expect(chavesDasLinhas()).toEqual(["c", "a", "b"]);
    expect(
      document.querySelector('th[aria-sort="descending"] [data-sort-id="ano"]'),
    ).not.toBeNull();
  });

  it("traz a coluna Categoria, que não existia no card", async () => {
    await montar();
    expect(
      screen.getByRole("columnheader", { name: /Categoria/ }),
    ).toBeInTheDocument();
    const linha = document.querySelector('[data-row-key="a"]')!;
    expect(within(linha as HTMLElement).getByText("ENEM")).toBeInTheDocument();
  });

  /** ⚠️ O critério de aceite central. */
  it("clicar na linha abre o ShowProva da MESMA prova", async () => {
    await montar();
    fireEvent.click(
      screen.getByRole("button", { name: "ENEM 2019 Reaplicação" }),
    );
    expect(await screen.findByTestId("show-prova")).toHaveTextContent(
      "ENEM 2019 Reaplicação",
    );
    expect(screen.getByTestId("show-prova")).not.toHaveTextContent("SEM PROVA");
  });

  /**
   * ⚠️ **A ação de relatório NÃO existe nesta tela**, e o interruptor é a tela,
   * não a permissão. O `simuladosView` é compartilhado com a
   * `partnerPrepProvas`; aqui o usuário é admin de plataforma e pode não ter
   * cursinho nenhum — a api resolve o cursinho pelo JWT e devolveria 403.
   * `gerenciarEstudantes` pode existir para um admin, então checar permissão
   * em vez da tela recolocaria a ação exatamente onde ela não pode estar.
   */
  it("⚠️ NÃO liga a ação de relatório no ShowProva — é a tela do admin", async () => {
    await montar();
    fireEvent.click(
      screen.getByRole("button", { name: "ENEM 2019 Reaplicação" }),
    );
    await screen.findByTestId("show-prova");

    expect(propsDoShowProva.atual).not.toBeNull();
    expect(propsDoShowProva.atual).not.toHaveProperty("relatorio");
  });

  it("uma prova sem questão nenhuma não é anunciada como Completa", async () => {
    await montar();
    const linha = document.querySelector('[data-row-key="c"]') as HTMLElement;
    expect(within(linha).getByText("Sem questões")).toBeInTheDocument();
    expect(within(linha).queryByText("Completa")).toBeNull();
    // E a barra não é desenhada — 0/0 não é 100%.
    expect(linha.querySelector('[data-faixa="validadas"]')).toBeNull();
    expect(within(linha).getByTestId("progresso")).toHaveAttribute(
      "data-sem-questoes",
      "true",
    );
  });

  it("o gabarito (string) vira ✓ e a sua ausência vira —", async () => {
    await montar();
    const com = document.querySelector('[data-row-key="a"]') as HTMLElement;
    const sem = document.querySelector('[data-row-key="b"]') as HTMLElement;
    expect(within(com).getByTitle("Com gabarito")).toHaveTextContent("✓");
    expect(within(sem).getByTitle("Sem gabarito")).not.toHaveTextContent("✓");
  });
});

describe("hierarquia das ações", () => {
  it("exatamente um botão laranja preenchido, e é Nova Prova", async () => {
    await montar();
    const laranjas = [...document.querySelectorAll("*")].filter((el) =>
      temClasse(el, "bg-orange"),
    );
    expect(laranjas).toHaveLength(1);
    expect(laranjas[0]).toHaveAttribute("data-action-id", "nova-prova");
    expect(laranjas[0]).toHaveTextContent("Nova Prova");
  });

  it("nenhum botão vermelho — 'Limpar filtros' deixou de ser ação de registro", async () => {
    await montar();
    for (const botao of document.querySelectorAll("button")) {
      expect(botao.className, botao.textContent ?? "").not.toMatch(
        /(^|\s)(bg-red|text-red)(\/|\s|$)/,
      );
    }
    expect(screen.queryByRole("button", { name: /Limpar filtros/ })).toBeNull();
  });

  it("as três secundárias ficam na barra", async () => {
    await montar();
    const barra = screen.getByTestId("dash-toolbar");
    for (const id of [
      "enviar-cartao",
      "gerenciar-categorias",
      "template-caderno",
    ]) {
      expect(
        barra.querySelector(`[data-action-id="${id}"]`),
        id,
      ).not.toBeNull();
    }
  });

  it("sem permissão, o botão é desabilitado e ganha o embrulho focável do motivo", async () => {
    estado.permissao = {
      ...TODAS_AS_PERMISSOES,
      [Roles.cadastrarProvas]: false,
    };
    await montar();

    const nova = document.querySelector(
      '[data-action-id="nova-prova"]',
    ) as HTMLButtonElement;
    expect(nova).toBeDisabled();
    // ⚠️ Botão desabilitado não recebe hover nem foco; é o `<span tabIndex=0>`
    // do `DashToolbar` que faz o motivo chegar em alguém. Sem `disabledReason`
    // ele não existe — e o motivo ficaria só no código.
    expect(nova.parentElement).toHaveAttribute("tabindex", "0");
  });
});

describe("filtros", () => {
  it("'Limpar filtros' só aparece com filtro ativo", async () => {
    await montar();
    expect(screen.queryByText(/Limpar filtros/)).toBeNull();

    fireEvent.click(screen.getByLabelText("Só com gabarito"));
    expect(screen.getByText("Limpar filtros (1)")).toBeInTheDocument();
    expect(chavesDasLinhas()).toEqual(["c", "a"]);
  });

  it("limpar filtros preserva a ordenação escolhida", async () => {
    await montar();

    fireEvent.click(document.querySelector('[data-sort-id="progresso"]')!);
    expect(chavesDasLinhas()).toEqual(["c", "b", "a"]);

    fireEvent.click(screen.getByLabelText("Só com gabarito"));
    fireEvent.click(screen.getByText("Limpar filtros (1)"));

    // ⚠️ Com o `key={resetKey}` do V1 o template remontava e a ordenação
    // voltava para `ano desc` — a pessoa limpa a busca e perde o que pediu.
    expect(chavesDasLinhas()).toEqual(["c", "b", "a"]);
    expect(
      document.querySelector(
        'th[aria-sort="ascending"] [data-sort-id="progresso"]',
      ),
    ).not.toBeNull();
    expect(
      (screen.getByLabelText("Só com gabarito") as HTMLInputElement).checked,
    ).toBe(false);
  });

  it("vazio por filtro e vazio de verdade são mensagens diferentes", async () => {
    await montar();
    // ⚠️ Combinação sem resultado: a reaplicação é a única prova sem gabarito.
    fireEvent.change(screen.getByLabelText("Todas edições"), {
      target: { value: Edicao.Reaplicacao },
    });
    fireEvent.click(screen.getByLabelText("Só com gabarito"));
    expect(chavesDasLinhas()).toEqual([]);
    expect(screen.getByText(TEXTO_VAZIO_COM_FILTRO)).toBeInTheDocument();
    expect(screen.queryByText(TEXTO_VAZIO_SEM_FILTRO)).toBeNull();
  });

  it("sem nenhuma prova cadastrada, a mensagem não fala de filtro", async () => {
    estado.provas = [];
    await montar();
    expect(screen.getByText(TEXTO_VAZIO_SEM_FILTRO)).toBeInTheDocument();
    expect(screen.queryByText(TEXTO_VAZIO_COM_FILTRO)).toBeNull();
  });
});

/**
 * ⚠️ **Último describe do arquivo, e é de propósito.** Abrir o `⋯` monta o
 * Popper do Radix, cujo posicionamento não converge com os rects zerados do
 * jsdom e deixa trabalho pendente que é cobrado do **próximo** teste — mesmo
 * desmontando com timer falso. Enquanto for o último, ninguém paga a conta.
 */
describe("o menu ⋯", () => {
  it("Sincronizar e Relatório Sync saíram da barra e moram no ⋯", async () => {
    const { unmount } = await montar();
    const barra = screen.getByTestId("dash-toolbar");
    expect(within(barra).queryByText("Sincronizar")).toBeNull();
    expect(within(barra).queryByText("Relatório Sync")).toBeNull();

    /*
      ⚠️ Uma única abertura de popover, com timer falso e sem `waitFor`. Cada
      montagem do Popper do Radix custa ~3s de CPU neste jsdom (o
      posicionamento não converge com os rects zerados) e o `waitFor` em tempo
      real fica realimentando esse loop até estourar. Todas as asserções do
      menu ficam nesta abertura.
    */
    vi.useFakeTimers();
    fireEvent.click(screen.getByRole("button", { name: "Mais ações" }));
    act(() => void vi.advanceTimersByTime(10));

    const menu = screen.getByRole("dialog");
    expect(within(menu).getByText("Sincronizar")).toBeInTheDocument();
    expect(within(menu).getByText("Relatório Sync")).toBeInTheDocument();
    expect(
      menu
        .querySelector('[data-action-id="sincronizar"]')!
        .getAttribute("class"),
    ).not.toContain("bg-orange");

    /*
      ⚠️ Desmontar **aqui**, ainda com o timer falso. O `cleanup()` do
      `afterEach` roda depois do `useRealTimers()`, e aí o loop de
      posicionamento do Popper que ficou pendente é cobrado do teste
      **seguinte** — foi o que aconteceu ao escrever este arquivo: o próximo
      teste do arquivo estourava o timeout sem ter feito nada.
    */
    act(() => unmount());
  }, 20_000);
});
