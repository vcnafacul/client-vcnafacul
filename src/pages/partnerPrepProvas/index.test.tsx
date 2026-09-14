import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Prova } from "../../dtos/prova/prova";
import { Edicao } from "../../enums/prova/edicao";
import { Roles } from "../../enums/roles/roles";

/* -------------------------------------------------------------------------- *
 * Mocks — o que está sob teste é a apresentação e o RECORTE: quais ações a tela
 * do cursinho tem, quais ela não pode ter, e qual serviço ela consulta.
 * -------------------------------------------------------------------------- */

const estado = vi.hoisted(() => ({
  provas: [] as unknown[],
  permissao: {} as Record<string, boolean>,
}));

const getProvasCursinho = vi.hoisted(() =>
  vi.fn(async () => ({ data: estado.provas })),
);
/**
 * ⚠️ Dublê do serviço **da administração**, que esta tela não pode chamar.
 * Sem ele mockado, um import acidental sairia pela rede no teste em vez de
 * falhar numa asserção.
 */
const getProvas = vi.hoisted(() => vi.fn(async () => ({ data: [] })));

vi.mock("../../services/prova/getProvasCursinho", () => ({
  getProvasCursinho,
}));
vi.mock("../../services/prova/getProvas", () => ({ getProvas }));
vi.mock("../../services/prova/createProvaCursinho", () => ({
  createProvaCursinho: vi.fn(),
}));
const getCategorias = vi.hoisted(() => vi.fn(async () => ({ data: [] })));
const getCategoriasCursinho = vi.hoisted(() =>
  vi.fn(async () => ({ data: [] })),
);
vi.mock("../../services/categoria/getCategorias", () => ({ getCategorias }));
vi.mock("../../services/categoria/getCategoriasCursinho", () => ({
  getCategoriasCursinho,
}));
vi.mock("../../services/categoria/createCategoriaCursinho", () => ({
  createCategoriaCursinho: vi.fn(),
}));
const deleteCategoriaCursinho = vi.hoisted(() => vi.fn());
vi.mock("../../services/categoria/deleteCategoriaCursinho", () => ({
  deleteCategoriaCursinho,
}));
vi.mock("../../store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok", permissao: estado.permissao } }),
}));
vi.mock("react-toastify", () => ({
  toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}));

/**
 * ⚠️ O dublê imprime o nome da prova recebida — é o que torna verificável
 * "clicar na linha abre o registro certo", em vez de só "abre alguma coisa".
 */
vi.mock("../dashProvas/modals/showProva", () => ({
  default: ({ prova }: { prova?: Prova | null }) => (
    <div data-testid="show-prova">{prova?.nome ?? "SEM PROVA"}</div>
  ),
}));
/** Imprime o serviço de criação recebido: o cursinho não pode criar prova global. */
vi.mock("../dashProvas/modals/newProva", () => ({
  default: ({ createService }: { createService?: unknown }) => (
    <div data-testid="modal-nova-prova">
      {createService ? "com-create-service" : "SEM CREATE SERVICE"}
    </div>
  ),
}));
/**
 * ⚠️ O dublê imprime as PROPS que recebeu. Sem isso não há como provar que a
 * tela do cursinho liga o `nomeLivre` e passa os serviços escopados — e sem
 * `nomeLivre` o cursinho recebe o formulário de prefixo, que não deixa digitar
 * "Enem Dia 1". Provado por mutação: sem esta asserção, remover a prop deixava
 * a suíte inteira verde.
 */
const propsDoModalCategorias = vi.hoisted(
  () => ({ atual: null }) as { atual: Record<string, unknown> | null },
);
vi.mock("../dashProvas/modals/manageCategorias", () => ({
  default: (props: Record<string, unknown>) => {
    propsDoModalCategorias.atual = props;
    return <div data-testid="modal-categorias" />;
  },
}));
vi.mock("../dashProvas/modals/uploadCartaoModal", () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="modal-cartao" /> : null,
}));

import PartnerPrepProvas from "./index";

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
  prova({ _id: "a", nome: "Simulado interno 2019" }),
  prova({
    _id: "b",
    nome: "Simulado interno 2023",
    ano: 2023,
    edicao: Edicao.Digital,
    totalQuestaoCadastradas: 120,
    totalQuestaoValidadas: 90,
  }),
];

const TODAS_AS_PERMISSOES: Record<string, boolean> = {
  [Roles.cadastrarProvasCursinho]: true,
  [Roles.visualizarProvasCursinho]: true,
  [Roles.visualizarEstudantes]: true,
  [Roles.alterarPermissao]: true,
  [Roles.gerenciarCategoriasCursinho]: true,
};

async function montar() {
  const utils = render(<PartnerPrepProvas />);
  // ⚠️ Dois flushes: as duas requisições resolvem em microtasks separadas.
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  return utils;
}

function chavesDasLinhas(): string[] {
  return [...document.querySelectorAll("[data-row-key]")].map(
    (el) => el.getAttribute("data-row-key") ?? "",
  );
}

beforeEach(() => {
  telaDesktop();
  estado.provas = PROVAS;
  estado.permissao = { ...TODAS_AS_PERMISSOES };
  getProvasCursinho.mockClear();
  getProvas.mockClear();
  getCategorias.mockClear();
  getCategoriasCursinho.mockClear();
});

describe("provas do cursinho — a mesma tabela da administração", () => {
  it("lista em tabela, ordenada por ano decrescente", async () => {
    await montar();
    expect(chavesDasLinhas()).toEqual(["b", "a"]);
  });

  it("traz as mesmas colunas, Categoria inclusive", async () => {
    await montar();
    for (const nome of [/Prova/, /Categoria/, /Ano/, /Progresso/, /Status/]) {
      expect(
        screen.getByRole("columnheader", { name: nome }),
      ).toBeInTheDocument();
    }
    const linha = document.querySelector('[data-row-key="a"]')!;
    expect(within(linha as HTMLElement).getByText("ENEM")).toBeInTheDocument();
  });

  it("clicar na linha abre o ShowProva da MESMA prova", async () => {
    await montar();
    fireEvent.click(
      screen.getByRole("button", { name: "Simulado interno 2023" }),
    );
    expect(screen.getByTestId("show-prova")).toHaveTextContent(
      "Simulado interno 2023",
    );
  });
});

describe("o recorte do cursinho", () => {
  /**
   * ⚠️ **A garantia central desta tela.** O recorte por cursinho é feito na
   * api, pelo JWT — mas se a tela chamasse `getProvas`, ela listaria as provas
   * de todo mundo e nada em tela indicaria isso.
   */
  it("consulta só o endpoint do cursinho, nunca o da administração", async () => {
    await montar();
    expect(getProvasCursinho).toHaveBeenCalledWith("tok", 1, 500);
    expect(getProvas).not.toHaveBeenCalled();
  });

  it("Nova Prova cria pelo serviço do cursinho, não pelo global", async () => {
    await montar();
    fireEvent.click(
      document.querySelector('[data-action-id="nova-prova"]') as HTMLElement,
    );
    expect(screen.getByTestId("modal-nova-prova")).toHaveTextContent(
      "com-create-service",
    );
  });

  it("Nova Prova exige a permissão do CURSINHO, não a da administração", async () => {
    // ⚠️ Se a tela tivesse copiado `Roles.cadastrarProvas`, este teste passaria
    // por acidente com as duas ligadas — daí desligar só a do cursinho.
    estado.permissao = {
      ...TODAS_AS_PERMISSOES,
      [Roles.cadastrarProvas]: true,
      [Roles.cadastrarProvasCursinho]: false,
    };
    await montar();

    const nova = document.querySelector(
      '[data-action-id="nova-prova"]',
    ) as HTMLButtonElement;
    expect(nova).toBeDisabled();
  });
});

describe("as ações que esta tela NÃO pode ter", () => {
  it.each([
    ["template-caderno", "só administradores publicam template"],
    ["sincronizar", "manutenção da base inteira"],
    ["relatorio-sync", "só faz sentido depois do sincronizar"],
  ])("não existe %s na barra — %s", async (id) => {
    await montar();
    expect(document.querySelector(`[data-action-id="${id}"]`)).toBeNull();
  });

  /**
   * ⚠️ **Esta asserção é a que vale, e o teste acima sozinho não bastava.**
   *
   * As ações de overflow moram dentro do Popover do `⋯`, que só é renderizado
   * quando aberto — então `querySelector('[data-action-id="sincronizar"]')`
   * devolve `null` tanto quando a ação não existe quanto quando ela existe e
   * está escondida no menu. Provado por mutação: pôr "Sincronizar" no
   * `overflow` deixava os três testes acima **verdes**.
   *
   * O `DashToolbar` só desenha o `⋯` quando há o que colapsar. Com duas
   * secundárias e nenhum overflow, ele não existe — e é isso que se verifica,
   * sem abrir Popover nenhum (o que custaria segundos de jsdom).
   */
  it("não há menu ⋯ — logo, não há ação escondida nele", async () => {
    await montar();
    expect(screen.queryByRole("button", { name: "Mais ações" })).toBeNull();
  });

  it("não renderiza o modal de template nem por engano", async () => {
    await montar();
    expect(screen.queryByTestId("modal-template")).toBeNull();
  });
});

describe("as ações que ficam", () => {
  it("Nova Prova é a única primária laranja", async () => {
    await montar();
    const laranjas = [...document.querySelectorAll("[data-action-id]")].filter(
      (el) =>
        (el.getAttribute("class") ?? "").split(/\s+/).includes("bg-orange"),
    );
    expect(laranjas).toHaveLength(1);
    expect(laranjas[0]).toHaveAttribute("data-action-id", "nova-prova");
  });

  it("as duas secundárias ficam na barra", async () => {
    await montar();
    const barra = screen.getByTestId("dash-toolbar");
    for (const id of ["enviar-cartao", "gerenciar-categorias"]) {
      expect(
        barra.querySelector(`[data-action-id="${id}"]`),
        id,
      ).not.toBeNull();
    }
  });
});

describe("filtros", () => {
  it("o checkbox de gabarito filtra e entra na contagem de filtros ativos", async () => {
    estado.provas = [
      prova({ _id: "a", nome: "Com gabarito" }),
      prova({ _id: "b", nome: "Sem gabarito", gabarito: "" }),
    ];
    await montar();
    expect(chavesDasLinhas()).toHaveLength(2);

    await act(async () => {
      fireEvent.click(screen.getByRole("checkbox"));
    });
    expect(chavesDasLinhas()).toEqual(["a"]);
    expect(screen.getByText(/Limpar filtros \(1\)/)).toBeInTheDocument();
  });
});

describe("categorias do cursinho", () => {
  it("busca as categorias pela rota do cursinho, nunca pela global", async () => {
    /**
     * ⚠️ O par do teste de provas. Se a tela chamar `getCategorias`, o cursinho
     * vê "Enem Dia 1" e "Enem Dia 2" da plataforma no modal de Nova Prova — que
     * é exatamente o que este trabalho existe para impedir.
     */
    await montar();
    expect(getCategoriasCursinho).toHaveBeenCalledWith("tok");
    expect(getCategorias).not.toHaveBeenCalled();
  });

  it("Gerenciar Categorias exige a permissão do cursinho, não a da administração", async () => {
    // ⚠️ Com `alterarPermissao` ligada e a do cursinho desligada: se a tela
    // tivesse ficado na permissão antiga, este teste passaria por acidente.
    estado.permissao = {
      ...TODAS_AS_PERMISSOES,
      [Roles.alterarPermissao]: true,
      [Roles.gerenciarCategoriasCursinho]: false,
    };
    await montar();

    const botao = document.querySelector(
      '[data-action-id="gerenciar-categorias"]',
    ) as HTMLButtonElement;
    expect(botao).toBeDisabled();
  });

  it("o modal recebe nomeLivre e os serviços escopados", async () => {
    await montar();
    fireEvent.click(
      document.querySelector(
        '[data-action-id="gerenciar-categorias"]',
      ) as HTMLElement,
    );

    const props = propsDoModalCategorias.atual!;
    // ⚠️ Sem `nomeLivre` o cursinho cai no formulário de prefixo e o nome é
    // gerado pelo pattern — "Enem Dia 1" vira 400 no backend.
    expect(props.nomeLivre).toBe(true);
    /**
     * ⚠️ Comparação por REFERÊNCIA, não por nome. Os serviços são `vi.fn()` no
     * teste, então `.name` é "spy" em todos — comparar nome deixaria passar o
     * serviço errado. E não pode ser arrow inline no componente: `listarService`
     * entra num array de dependências e mudaria de identidade a cada render.
     */
    expect(props.listarService).toBe(getCategoriasCursinho);
    expect(props.excluirService).toBe(deleteCategoriaCursinho);
    expect(typeof props.criarService).toBe("function");
  });

  it("com a permissão do cursinho, o botão fica ativo", async () => {
    // ⚠️ O par do de cima: trocar a permissão não pode ter deixado a ação
    // inalcançável para quem tem direito a ela.
    await montar();
    const botao = document.querySelector(
      '[data-action-id="gerenciar-categorias"]',
    ) as HTMLButtonElement;
    expect(botao).not.toBeDisabled();
  });
});
