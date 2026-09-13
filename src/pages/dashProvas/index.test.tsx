import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  mockAllIsIntersecting,
  resetIntersectionMocking,
  setupIntersectionMocking,
} from "react-intersection-observer/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Prova } from "../../dtos/prova/prova";
import { Paginate } from "../../utils/paginate";
import DashProva from ".";

// --- mocks de infraestrutura -------------------------------------------------

vi.mock("../../services/prova/getProvas", () => ({ getProvas: vi.fn() }));
vi.mock("../../services/prova/getSyncReport", () => ({
  getSyncReport: vi.fn(),
}));
vi.mock("../../services/prova/startSync", () => ({ startSync: vi.fn() }));
vi.mock("../../services/categoria/getCategorias", () => ({
  getCategorias: vi.fn(async () => ({ data: [] })),
}));
vi.mock("./utils/syncReportPdf", () => ({ downloadSyncReportPdf: vi.fn() }));

// Modais são pesados (TipTap, pdf, upload) e nunca abrem neste teste.
vi.mock("./modals/newProva", () => ({ default: () => null }));
vi.mock("./modals/showProva", () => ({ default: () => null }));
vi.mock("./modals/manageCategorias", () => ({ default: () => null }));
vi.mock("./modals/manageTemplate", () => ({ default: () => null }));
vi.mock("./modals/uploadCartaoModal", () => ({ default: () => null }));

vi.mock("../../store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok", permissao: {} } }),
}));
vi.mock("react-toastify", () => ({
  toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}));

import { getProvas } from "../../services/prova/getProvas";

const mockedGetProvas = vi.mocked(getProvas);

// --- dados -------------------------------------------------------------------

/**
 * O template só marca o card sentinela do fim em
 * `index === entities.length - Math.floor(limitCards * 0.25)`. Com o
 * `limitCards = 500` da tela, a lista RENDERIZADA (ou seja, a filtrada) precisa
 * ter pelo menos 125 itens para o scroll infinito chegar a disparar.
 */
const COM_GABARITO = 130;
const SEM_GABARITO = 5;
const PAGINA_2 = 3;

function prova(nome: string, gabarito: string): Prova {
  return {
    _id: nome,
    nome,
    gabarito,
    edicao: "" as Prova["edicao"],
    aplicacao: 1,
    ano: 2024,
    categoria: { id: "c", nome: "cat" } as unknown as Prova["categoria"],
    totalQuestao: 1,
    totalQuestaoCadastradas: 1,
    totalQuestaoValidadas: 1,
    createdAt: undefined as unknown as Prova["createdAt"],
    filename: "f",
    enemAreas: [],
  };
}

function lista(prefixo: string, qtd: number, gabarito: string): Prova[] {
  return Array.from({ length: qtd }, (_, i) =>
    prova(`${prefixo}-${i}`, gabarito),
  );
}

const paginaUm = [
  ...lista("com-gabarito", COM_GABARITO, "gab.pdf"),
  ...lista("sem-gabarito", SEM_GABARITO, ""),
];
const paginaDois = lista("pagina2", PAGINA_2, "");

function paginate(data: Prova[], page: number): Paginate<Prova> {
  return { data, page, limit: 500, totalItems: data.length };
}

function nomesRenderizados() {
  return screen
    .queryAllByText(/^(com-gabarito|sem-gabarito|pagina2)-\d+$/)
    .map((el) => el.textContent);
}

beforeEach(() => {
  setupIntersectionMocking(vi.fn);
  vi.clearAllMocks();
  mockedGetProvas.mockImplementation(async (_token, page) =>
    page === 1 ? paginate(paginaUm, 1) : paginate(paginaDois, page!),
  );
});

afterEach(() => {
  resetIntersectionMocking();
});

describe("DashProva — scroll infinito com filtro ativo", () => {
  it("não descarta as provas escondidas pelo filtro ao carregar a próxima página", async () => {
    render(<DashProva />);

    // 1) carga inicial
    await act(async () => {});
    expect(nomesRenderizados()).toHaveLength(COM_GABARITO + SEM_GABARITO);

    // 2) filtra: só com gabarito
    await act(async () => {
      fireEvent.click(screen.getByRole("checkbox"));
    });
    expect(nomesRenderizados()).toHaveLength(COM_GABARITO);

    // 3) rola até o fim, ainda filtrado
    await act(async () => {
      mockAllIsIntersecting(true);
    });
    expect(mockedGetProvas).toHaveBeenCalledWith("tok", 2, 500);

    // 4) limpa o filtro — tudo tem que voltar
    await act(async () => {
      fireEvent.click(screen.getByText("Limpar filtros"));
    });

    const nomes = nomesRenderizados();
    expect(nomes).toHaveLength(COM_GABARITO + SEM_GABARITO + PAGINA_2);
    // As escondidas pelo filtro continuam no estado (é o defeito do ticket).
    for (let i = 0; i < SEM_GABARITO; i++) {
      expect(nomes).toContain(`sem-gabarito-${i}`);
    }
    // E as da página nova entraram.
    for (let i = 0; i < PAGINA_2; i++) {
      expect(nomes).toContain(`pagina2-${i}`);
    }
  });

  it("para de requisitar quando o backend sinaliza o fim, e nunca pede página < 1", async () => {
    render(<DashProva />);
    await act(async () => {});

    for (let i = 0; i < 6; i++) {
      await act(async () => {
        mockAllIsIntersecting(false);
      });
      await act(async () => {
        mockAllIsIntersecting(true);
      });
    }

    const paginas = mockedGetProvas.mock.calls.map((c) => c[1] as number);
    // Página 2 veio incompleta (3 < 500) => fim da lista: nada além dela.
    expect(paginas).toEqual([1, 2]);
    expect(paginas).not.toContain(0);
  });
});
