import { DEBOUNCE_BUSCA_MS } from "@/components/dashV2";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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
 * ⚠️ Só o `useNavigate` e o `useLocation` são dublados — o resto do
 * `react-router-dom` continua real, senão o `MemoryRouter` do `montar` sumiria
 * junto.
 *
 * ⚠️ O `useLocation` dublado devolve **sempre o mesmo `state`**, mesmo depois
 * do `navigate(..., { state: null })` que a tela dispara para consumi-lo. É de
 * propósito: é assim que o teste de "fechar não reabre" consegue provar que
 * quem segura o laço é o `ref`, e não a limpeza do state.
 */
const navigate = vi.hoisted(() => vi.fn());
const estadoDaLocation = vi.hoisted(() => ({ atual: null as unknown }));
const CAMINHO_DA_TELA = "/dashboard/cursinho-provas";
vi.mock("react-router-dom", async (original) => ({
  ...(await original<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
  useLocation: () => ({
    pathname: "/dashboard/cursinho-provas",
    state: estadoDaLocation.atual,
  }),
}));

/**
 * ⚠️ O dublê imprime o nome da prova recebida — é o que torna verificável
 * "clicar na linha abre o registro certo", em vez de só "abre alguma coisa".
 *
 * ⚠️ E guarda a prop `relatorio`: é o **interruptor por tela** da ação de
 * relatório do cartão-resposta. O `simuladosView` é compartilhado com a
 * `dashprovas`, e é esta tela — não a permissão — que decide que a ação existe.
 * Ver o par deste teste em `dashProvas/index.test.tsx`.
 */
const propsDoShowProva = vi.hoisted(
  () => ({ atual: null }) as { atual: Record<string, unknown> | null },
);
vi.mock("../dashProvas/modals/showProva", () => ({
  default: (props: { prova?: Prova | null }) => {
    propsDoShowProva.atual = props as Record<string, unknown>;
    return <div data-testid="show-prova">{props.prova?.nome ?? "SEM PROVA"}</div>;
  },
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

/**
 * Uma lista grande o bastante para ter mais de uma página (o `pageSize` do
 * `DashListTemplate` é 25). O `ano` decrescente fixa a ordem: a ordenação
 * padrão da tela é `ano desc`, então a prova `i` cai exatamente na posição `i`.
 */
function provasNumeradas(quantas: number): Prova[] {
  return Array.from({ length: quantas }, (_, i) =>
    prova({
      _id: `p${i}`,
      nome: `Prova ${i}`,
      ano: 3000 - i,
      edicao: Edicao.Digital,
    }),
  );
}

const TODAS_AS_PERMISSOES: Record<string, boolean> = {
  [Roles.cadastrarProvasCursinho]: true,
  [Roles.visualizarProvasCursinho]: true,
  [Roles.visualizarEstudantes]: true,
  [Roles.alterarPermissao]: true,
  [Roles.gerenciarCategoriasCursinho]: true,
};

async function montar() {
  // ⚠️ `MemoryRouter`: a tela navega para o relatório do simulado, e o
  // `useNavigate` exige um Router acima.
  const utils = render(
    <MemoryRouter>
      <PartnerPrepProvas />
    </MemoryRouter>,
  );
  // ⚠️ Dois flushes: as duas requisições resolvem em microtasks separadas.
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  return utils;
}

/** `montar`, mas com a tela chegando de volta do relatório. */
async function montarComState(state: unknown) {
  estadoDaLocation.atual = state;
  return await montar();
}

/** O `de` que o relatório devolve, com os cinco filtros e a página. */
function deVolta(over: {
  filtros?: Partial<{
    nome: string;
    edicao: string;
    aplicacao: string;
    ano: string;
    gabaritoOnly: boolean;
  }>;
  provaId?: string;
  pagina?: number;
}) {
  return {
    de: {
      caminho: CAMINHO_DA_TELA,
      filtros: {
        nome: "",
        edicao: "",
        aplicacao: "",
        ano: "",
        gabaritoOnly: false,
        ...over.filtros,
      },
      provaId: over.provaId ?? "b",
      pagina: over.pagina ?? 1,
    },
  };
}

function chavesDasLinhas(): string[] {
  return [...document.querySelectorAll("[data-row-key]")].map(
    (el) => el.getAttribute("data-row-key") ?? "",
  );
}

beforeEach(() => {
  telaDesktop();
  propsDoShowProva.atual = null;
  estadoDaLocation.atual = null;
  navigate.mockClear();
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

  /**
   * ⚠️ **O par do teste em `dashProvas/index.test.tsx`**, que exige a ausência
   * desta prop lá. É esta tela — e não a permissão — que liga a ação: o
   * `simuladosView` é compartilhado, e na `dashprovas` o usuário pode não ter
   * cursinho nenhum, o que faria a api devolver 403.
   */
  it("⚠️ liga a ação de relatório no ShowProva, e navega para a rota nova", async () => {
    await montar();
    fireEvent.click(
      screen.getByRole("button", { name: "Simulado interno 2023" }),
    );

    const relatorio = propsDoShowProva.atual?.relatorio as {
      permitido: boolean;
      aoAbrir: (s: { _id: string }) => void;
    };
    expect(relatorio).toBeDefined();
    // `gerenciarEstudantes` é um segundo gate, mais baixo: desabilita com
    // motivo, nunca decide em qual tela a ação aparece.
    expect(relatorio.permitido).toBe(false);

    relatorio.aoAbrir({ _id: "sim-1" });
    // ⚠️ E leva junto de onde saiu — o relatório é rota, e sem isto o "voltar"
    // devolve a pessoa a uma listagem sem filtro, na página 1, sem modal.
    expect(navigate).toHaveBeenCalledWith(
      "/dashboard/relatorio-simulado/sim-1",
      {
        state: {
          de: {
            caminho: CAMINHO_DA_TELA,
            filtros: {
              nome: "",
              edicao: "",
              aplicacao: "",
              ano: "",
              gabaritoOnly: false,
            },
            provaId: "b",
            pagina: 1,
          },
        },
      },
    );
  });

  it("com gerenciarEstudantes, a ação de relatório fica permitida", async () => {
    estado.permissao = {
      ...TODAS_AS_PERMISSOES,
      [Roles.gerenciarEstudantes]: true,
    };
    await montar();
    fireEvent.click(
      screen.getByRole("button", { name: "Simulado interno 2023" }),
    );

    expect(
      (propsDoShowProva.atual?.relatorio as { permitido: boolean }).permitido,
    ).toBe(true);
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

/* -------------------------------------------------------------------------- *
 * A ida e a volta do relatório.
 *
 * ⚠️ O relatório é ROTA, não modal — foi o preço de ter link compartilhável e
 * página imprimível. Quem paga esse preço é a listagem, que sem isto volta sem
 * filtro, na página 1 e sem o modal aberto.
 * -------------------------------------------------------------------------- */

const rodape = () => screen.getByTestId("dash-list-footer");
const intervalo = () => rodape().querySelector("p")?.textContent;
const irParaPagina = (n: string) =>
  fireEvent.click(within(rodape()).getByText(n));

function aoAbrirRelatorio(simuladoId: string) {
  const relatorio = propsDoShowProva.atual?.relatorio as {
    aoAbrir: (s: { _id: string }) => void;
  };
  relatorio.aoAbrir({ _id: simuladoId });
}

describe("ida para o relatório — o que vai no state", () => {
  it("⚠️ leva os cinco filtros, a prova e a PÁGINA em que a pessoa estava", async () => {
    estado.provas = provasNumeradas(30);
    await montar();

    /*
      ⚠️ **A busca é debounced em 250ms** pela `DashFilterBar` — só o `change`
      mexe no rascunho do campo, e não no `nameFilter` da tela. Sem esperar o
      debounce, o teste passava a acreditar que levava o nome no state levando
      string vazia.
    */
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Buscar por nome"), {
        target: { value: "Prova" },
      });
      await new Promise((resolve) =>
        setTimeout(resolve, DEBOUNCE_BUSCA_MS + 20),
      );
    });
    await act(async () => {
      fireEvent.change(screen.getByLabelText("Todas edições"), {
        target: { value: Edicao.Digital },
      });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("checkbox"));
    });

    // ⚠️ Paginar DEPOIS de filtrar: trocar filtro devolve o template à página 1.
    await act(async () => {
      irParaPagina("2");
    });
    expect(intervalo()).toBe("Mostrando 26–30 de 30");

    fireEvent.click(screen.getByRole("button", { name: "Prova 25" }));
    aoAbrirRelatorio("sim-9");

    expect(navigate).toHaveBeenLastCalledWith(
      "/dashboard/relatorio-simulado/sim-9",
      {
        state: {
          de: {
            caminho: CAMINHO_DA_TELA,
            filtros: {
              nome: "Prova",
              edicao: Edicao.Digital,
              aplicacao: "",
              ano: "",
              gabaritoOnly: true,
            },
            provaId: "p25",
            pagina: 2,
          },
        },
      },
    );
  });
});

describe("volta do relatório — o que o state restaura", () => {
  it("⚠️ restaura os cinco filtros, e a lista já pinta filtrada", async () => {
    await montarComState(
      deVolta({
        filtros: {
          nome: "2023",
          edicao: Edicao.Digital,
          aplicacao: "1",
          ano: "2023",
          gabaritoOnly: true,
        },
      }),
    );

    expect(screen.getByPlaceholderText("Buscar por nome")).toHaveValue("2023");
    expect(screen.getByLabelText("Todas edições")).toHaveValue(Edicao.Digital);
    expect(screen.getByLabelText("Todas aplicações")).toHaveValue("1");
    expect(screen.getByLabelText("Todos os anos")).toHaveValue("2023");
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByText(/Limpar filtros \(5\)/)).toBeInTheDocument();
    expect(chavesDasLinhas()).toEqual(["b"]);
  });

  /**
   * ⚠️ **Este é o teste que exige o inicializador do `useState`.**
   *
   * Com os filtros chegando por `useEffect`, a `activeFilterCount` sai de 0 e
   * vira 2 num render posterior — e o `DashListTemplate` trata isso como
   * "trocou o filtro" e volta para a página 1. A pessoa vê a lista inteira
   * piscar **e** perde a página. Restaurando no primeiro render, a contagem já
   * nasce 2 e nada é resetado.
   */
  it("⚠️ a página restaurada sobrevive aos filtros restaurados", async () => {
    estado.provas = provasNumeradas(60);

    await montarComState(
      deVolta({
        filtros: { nome: "Prova", gabaritoOnly: true },
        provaId: "p0",
        pagina: 3,
      }),
    );

    expect(intervalo()).toBe("Mostrando 51–60 de 60");
  });

  /**
   * ⚠️ **Reabrir o modal espera a lista chegar.** `onClickCard` faz
   * `provas.find(...)`; restaurar no mount, com `provas` ainda vazio, acha
   * `undefined` — e o `ShowProva` recebe uma prova que não existe.
   */
  it("⚠️ reabre o modal na prova certa, e só depois de a lista chegar", async () => {
    await montarComState(deVolta({ provaId: "b" }));

    expect(screen.getByTestId("show-prova")).toHaveTextContent(
      "Simulado interno 2023",
    );
  });

  /**
   * ⚠️ **O estado pela metade é a única razão de a `restauracaoCompleta`
   * existir** — e era o único que nenhum teste exercia. O completo restaura e
   * o ausente não restaura nada; o que falta provar é que um `de` com
   * `filtros` mas sem `provaId` nem `pagina` cai no mesmo lugar do ausente.
   *
   * Meia restauração é pior que nenhuma: a pessoa vê a lista filtrada, não vê
   * o modal, e não tem como saber qual metade voltou.
   */
  const FILTROS_CHEIOS = {
    nome: "2023",
    edicao: Edicao.Digital,
    aplicacao: "1",
    ano: "2023",
    gabaritoOnly: true,
  };

  /**
   * Um caso por conjunto que falta — é assim que cada pedaço da guarda fica
   * coberto, e não por um caso só: com apenas "filtros sem o resto", derrubar
   * o `!!de.provaId` da guarda continuaria devolvendo `false` e o teste
   * passaria do mesmo jeito.
   */
  it.each([
    ["só filtros", { filtros: FILTROS_CHEIOS }],
    ["filtros e prova, sem página", { filtros: FILTROS_CHEIOS, provaId: "b" }],
    ["filtros e página, sem prova", { filtros: FILTROS_CHEIOS, pagina: 2 }],
    ["prova e página, sem filtros", { provaId: "b", pagina: 2 }],
  ])(
    "⚠️ restauração pela metade (%s) não restaura NADA — nem filtro, nem modal",
    async (_caso, parcial) => {
      await montarComState({ de: { caminho: CAMINHO_DA_TELA, ...parcial } });

      expect(screen.getByPlaceholderText("Buscar por nome")).toHaveValue("");
      expect(screen.getByLabelText("Todas edições")).toHaveValue("");
      expect(screen.getByLabelText("Todas aplicações")).toHaveValue("");
      expect(screen.getByLabelText("Todos os anos")).toHaveValue("");
      expect(screen.getByRole("checkbox")).not.toBeChecked();
      expect(screen.queryByText(/Limpar filtros/)).toBeNull();
      expect(screen.queryByTestId("show-prova")).toBeNull();
    },
  );

  it("prova que não está mais na lista não abre modal nenhum", async () => {
    await montarComState(deVolta({ provaId: "sumiu" }));

    expect(screen.queryByTestId("show-prova")).toBeNull();
  });

  /**
   * ⚠️ **O state é consumido uma vez só.** Sem a limpeza, um `navigate`
   * posterior para esta mesma rota ressuscita filtros que a pessoa já trocou.
   */
  it("⚠️ consome o state, com replace, uma vez só", async () => {
    await montarComState(deVolta({ provaId: "b" }));

    expect(navigate).toHaveBeenCalledWith(CAMINHO_DA_TELA, {
      replace: true,
      state: null,
    });
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  /**
   * ⚠️ **O guard de "já restaurei" é o que impede o laço.** O `useModals`
   * devolve objetos novos a cada render, então o efeito roda em todo render;
   * sem o `ref`, fechar o modal restaurado o reabriria na hora.
   */
  it("⚠️ fechar o modal restaurado não o reabre", async () => {
    await montarComState(deVolta({ provaId: "b" }));
    const fechar = propsDoShowProva.atual!.handleClose as () => void;

    await act(async () => {
      fechar();
    });

    expect(screen.queryByTestId("show-prova")).toBeNull();
  });
});
