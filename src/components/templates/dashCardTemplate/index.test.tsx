import { act, render, screen } from "@testing-library/react";
import {
  mockAllIsIntersecting,
  resetIntersectionMocking,
  setupIntersectionMocking,
} from "react-intersection-observer/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DashCardContext,
  DashCardContextProps,
} from "../../../context/dashCardContext";
import { StatusEnum } from "../../../enums/generic/statusEnum";
import { Paginate } from "../../../utils/paginate";
import DashCardTemplate from ".";

/**
 * `limitCards` precisa ser >= 4 para o template conseguir marcar o card
 * sentinela do fim (`index === entities.length - Math.floor(limitCards*0.25)`),
 * e a lista precisa ter >= 4*limitCards itens para existir o sentinela do topo.
 */
const LIMIT_CARDS = 4;

type Entity = { id: string; nome: string };

function makeEntities(qtd: number, prefixo = "e"): Entity[] {
  return Array.from({ length: qtd }, (_, i) => ({
    id: `${prefixo}${i}`,
    nome: `${prefixo}${i}`,
  }));
}

function paginate(data: Entity[]): Paginate<Entity> {
  return { data, page: 1, limit: LIMIT_CARDS, totalItems: data.length };
}

function renderTemplate(overrides: Partial<DashCardContextProps<Entity>>) {
  const value: DashCardContextProps<Entity> = {
    title: "Provas",
    entities: makeEntities(4 * LIMIT_CARDS),
    setEntities: vi.fn(),
    onClickCard: vi.fn(),
    getMoreCards: vi.fn(async (_page: number) =>
      paginate(makeEntities(LIMIT_CARDS, "novo")),
    ),
    cardTransformation: (entity: Entity) => ({
      id: entity.id,
      title: entity.nome,
      status: StatusEnum.Approved,
    }),
    limitCards: LIMIT_CARDS,
    ...overrides,
  };

  render(
    <DashCardContext.Provider value={value}>
      <DashCardTemplate />
    </DashCardContext.Provider>,
  );

  return value;
}

/** Um ciclo de scroll: os sentinelas saem de vista e voltam. */
async function scrollCycle() {
  await act(async () => {
    mockAllIsIntersecting(false);
  });
  await act(async () => {
    mockAllIsIntersecting(true);
  });
}

beforeEach(() => {
  // Sem `globals: true` o test-utils não se instala sozinho.
  setupIntersectionMocking(vi.fn);
  vi.clearAllMocks();
});

afterEach(() => {
  resetIntersectionMocking();
});

describe("DashCardTemplate — scroll infinito com `onLoadMore`", () => {
  it("nunca chama `setEntities` (o estado é da tela, não da lista derivada)", async () => {
    const onLoadMore = vi.fn();
    const { setEntities } = renderTemplate({ onLoadMore });

    await act(async () => {
      mockAllIsIntersecting(true);
    });
    await scrollCycle();
    await scrollCycle();

    expect(onLoadMore).toHaveBeenCalled();
    expect(setEntities).not.toHaveBeenCalled();
  });

  it("avisa a página seguinte, uma por vez, na ordem", async () => {
    const onLoadMore = vi.fn();
    renderTemplate({ onLoadMore });

    await act(async () => {
      mockAllIsIntersecting(true);
    });
    expect(onLoadMore.mock.calls.map((c) => c[0])).toEqual([2]);

    await scrollCycle();
    await scrollCycle();

    expect(onLoadMore.mock.calls.map((c) => c[0])).toEqual([2, 3, 4]);
  });

  it("não busca nada por conta própria — nem descendo, nem voltando ao topo", async () => {
    const onLoadMore = vi.fn();
    const { getMoreCards } = renderTemplate({ onLoadMore });

    await act(async () => {
      mockAllIsIntersecting(true);
    });
    // Passa de `limitPages` (4) para cobrir também o ramo de "voltar ao topo",
    // que só existe na janela deslizante do modo legado.
    for (let i = 0; i < 6; i++) await scrollCycle();

    expect(onLoadMore.mock.calls.length).toBeGreaterThan(4);
    expect(getMoreCards).not.toHaveBeenCalled();
  });

  it("nunca avisa uma página menor que 1, mesmo depois de várias páginas", async () => {
    const onLoadMore = vi.fn();
    renderTemplate({ onLoadMore });

    await act(async () => {
      mockAllIsIntersecting(true);
    });
    for (let i = 0; i < 6; i++) await scrollCycle();

    const paginas = onLoadMore.mock.calls.map((c) => c[0] as number);
    expect(paginas.length).toBeGreaterThan(0);
    expect(paginas.every((p) => p >= 1)).toBe(true);
  });
});

describe("DashCardTemplate — modo legado (sem `onLoadMore`)", () => {
  it("continua concatenando via `setEntities`, como antes", async () => {
    const entities = makeEntities(LIMIT_CARDS + 1);
    const novos = makeEntities(LIMIT_CARDS, "novo");
    const { setEntities, getMoreCards } = renderTemplate({
      entities,
      getMoreCards: vi.fn(async (_page: number) => paginate(novos)),
    });

    await act(async () => {
      mockAllIsIntersecting(true);
    });

    expect(getMoreCards).toHaveBeenCalledWith(2);
    expect(setEntities).toHaveBeenCalledTimes(1);
    expect(setEntities).toHaveBeenCalledWith([...entities, ...novos]);
  });

  it("mantém a janela deslizante quando a lista está cheia (4 * limitCards)", async () => {
    const entities = makeEntities(4 * LIMIT_CARDS);
    const novos = makeEntities(LIMIT_CARDS, "novo");
    const { setEntities } = renderTemplate({
      entities,
      getMoreCards: vi.fn(async (_page: number) => paginate(novos)),
    });

    await act(async () => {
      mockAllIsIntersecting(true);
    });

    expect(setEntities).toHaveBeenCalledWith([
      ...entities.slice(LIMIT_CARDS),
      ...novos,
    ]);
  });

  it("nunca pede uma página menor que 1 ao voltar para o topo", async () => {
    // Página 5 é o caso limite: `page - 1 - limitPages` dá 0, e página 0 vira
    // `skip` negativo no backend paginado.
    const getMoreCards = vi.fn(async (_page: number) =>
      paginate(makeEntities(LIMIT_CARDS, "novo")),
    );
    renderTemplate({ getMoreCards });

    await act(async () => {
      mockAllIsIntersecting(true);
    });
    for (let i = 0; i < 6; i++) await scrollCycle();

    const paginas = getMoreCards.mock.calls.map((c) => c[0]);
    expect(paginas.length).toBeGreaterThan(4);
    expect(paginas).not.toContain(0);
    expect(paginas.every((p) => p >= 1)).toBe(true);
  });

  it("volta a carregar a página anterior quando ela existe (>= 1)", async () => {
    const getMoreCards = vi.fn(async (_page: number) =>
      paginate(makeEntities(LIMIT_CARDS, "novo")),
    );
    renderTemplate({ getMoreCards });

    await act(async () => {
      mockAllIsIntersecting(true);
    });
    for (let i = 0; i < 6; i++) await scrollCycle();

    const paginas = getMoreCards.mock.calls.map((c) => c[0]);
    expect(paginas).toContain(1);
  });

  it("renderiza um card por entidade", () => {
    renderTemplate({ entities: makeEntities(3) });
    expect(screen.getByText("e0")).toBeInTheDocument();
    expect(screen.getByText("e1")).toBeInTheDocument();
    expect(screen.getByText("e2")).toBeInTheDocument();
  });
});
