import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Limites } from "./regras";

vi.mock("../../components/templates/baseTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// O Leaflet não roda no jsdom: o MapBox vira um espião das props.
const mapBox = vi.hoisted(() => ({ props: [] as Record<string, unknown>[] }));
vi.mock("@/components/molecules/mapBox", () => ({
  MarkerPin: () => null,
  default: (p: Record<string, unknown>) => {
    mapBox.props.push(p);
    return <div data-testid="mapa">{p.mapEvent as React.ReactNode}</div>;
  },
}));

// O controlador do mapa entrega a área e o mapa: aqui, o teste é quem manda.
const controle = vi.hoisted(() => ({
  onLimites: (() => {}) as (l: Limites) => void,
  onCliqueNoMapa: (() => {}) as () => void,
  mapa: {
    flyTo: vi.fn(),
    fitBounds: vi.fn(),
    // Projeção de brinquedo: o "pixel" é o próprio [lat, lon], e o `add`
    // guarda o deslocamento para o teste conferir.
    project: (ll: [number, number]) => ({
      add: ([dx, dy]: [number, number]) => ({ ll, dx, dy }),
    }),
    unproject: (p: { ll: [number, number]; dx: number; dy: number }) => ({
      centroDeslocado: p.ll,
      dx: p.dx,
      dy: p.dy,
    }),
  },
}));
vi.mock("./components/MapaController", () => ({
  MapaController: ({
    onLimites,
    onMapa,
    onCliqueNoMapa,
  }: {
    onLimites: (l: Limites) => void;
    onMapa: (m: unknown) => void;
    onCliqueNoMapa: () => void;
  }) => {
    controle.onLimites = onLimites;
    controle.onCliqueNoMapa = onCliqueNoMapa;
    onMapa(controle.mapa);
    return null;
  },
}));

const api = vi.hoisted(() => ({ buscarGeoPublico: vi.fn() }));
// O modal de reportar tem teste próprio; aqui só importa o que ele recebe.
vi.mock("@/components/organisms/map/modal/report", () => ({
  default: (p: { entityId: string; type: string }) => (
    <div role="dialog" aria-label="Reportar">
      {p.entityId}|{p.type}
    </div>
  ),
}));
vi.mock("@/services/geolocation/getGeolocation", () => api);

import GeoSearch from ".";

const geo = (id: string, lat: number, lon: number, type = 0) => ({
  id,
  name: `Cursinho ${id}`,
  state: "SP",
  city: "Campinas",
  latitude: lat,
  longitude: lon,
  type,
  createdAt: "2026-09-27T15:00:00Z",
});
const CAMPINAS: Limites = {
  norte: -22.8,
  sul: -23.0,
  leste: -46.9,
  oeste: -47.2,
};

const localAtual = { search: "" };
function EspiaUrl() {
  localAtual.search = useLocation().search;
  return null;
}

async function abrir(url = "/localiza-cursinho") {
  render(
    <MemoryRouter initialEntries={[url]}>
      <GeoSearch />
      <EspiaUrl />
    </MemoryRouter>,
  );
  await screen.findByTestId("mapa");
  await act(async () => {});
}
const ultimasProps = () => mapBox.props[mapBox.props.length - 1];

beforeEach(() => {
  mapBox.props = [];
  controle.mapa.flyTo.mockClear();
  controle.mapa.fitBounds.mockClear();
  Element.prototype.scrollIntoView = vi.fn();
  api.buscarGeoPublico.mockResolvedValue([
    geo("a", -22.9, -47.06),
    geo("b", -22.95, -47.1),
    geo("longe", -21.0, -47.9),
    geo("unicamp", -22.82, -47.07, 1),
  ]);
});

describe("Localiza Cursinho — mapa e lista (card 05)", () => {
  it("a lista mostra os cursinhos da área visível (sem universidade)", async () => {
    await abrir();
    act(() => controle.onLimites(CAMPINAS));

    expect(
      await screen.findByRole("heading", { name: "Cursinho a" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Cursinho b" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Cursinho longe" }),
    ).toBeNull();
    expect(
      screen.queryByRole("heading", { name: "Cursinho unicamp" }),
    ).toBeNull();
  });

  it("⚠️ arrastar o mapa NÃO recria os markers (senão o mapa pisca)", async () => {
    await abrir();
    act(() => controle.onLimites(CAMPINAS));
    const antes = ultimasProps().markers;
    act(() => controle.onLimites({ ...CAMPINAS, norte: -22.7 }));
    expect(ultimasProps().markers).toBe(antes);
  });

  it("universidade aparece no mapa, e o filtro tira", async () => {
    await abrir();
    const ids = () =>
      (ultimasProps().markers as { id: string }[]).map((m) => m.id);
    expect(ids()).toContain("unicamp");
    fireEvent.click(screen.getByText(/Universidade/i));
    expect(ids()).not.toContain("unicamp");
  });

  it("clique no card: voa até o cursinho (zoom 14) e marca o pin", async () => {
    await abrir();
    act(() => controle.onLimites(CAMPINAS));
    fireEvent.click(await screen.findByRole("button", { name: /Cursinho b/ }));

    // ⚠️ O centro vai 210px para a direita: o cartão do mapa (07) abre no
    // canto inferior direito e, centralizado, cobriria o próprio pin.
    expect(controle.mapa.flyTo).toHaveBeenCalledWith(
      { centroDeslocado: [-22.95, -47.1], dx: 210, dy: 0 },
      14,
    );
    expect(ultimasProps().activeId).toBe("b");
  });

  it("hover no card destaca o pin", async () => {
    await abrir();
    act(() => controle.onLimites(CAMPINAS));
    fireEvent.mouseEnter(
      await screen.findByRole("button", { name: /Cursinho a/ }),
    );
    expect(ultimasProps().activeId).toBe("a");
  });

  it("clique no pin: destaca o card e rola até ele", async () => {
    await abrir();
    act(() => controle.onLimites(CAMPINAS));
    await screen.findByRole("heading", { name: "Cursinho a" });

    act(() => (ultimasProps().onMarkerClick as (id: string) => void)("a"));

    const card = screen
      .getByRole("heading", { name: "Cursinho a" })
      .closest("article")!;
    expect(card.className).toContain("border-orange");
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("o mapa desta tela aceita zoom pela roda do mouse", async () => {
    await abrir();
    expect(ultimasProps().scrollWheelZoom).toBe(true);
  });

  it("erro ao carregar → aviso com 'tentar de novo'", async () => {
    api.buscarGeoPublico.mockRejectedValueOnce(
      new Error("Não foi possível carregar os cursinhos"),
    );
    await abrir();
    expect(
      await screen.findByRole("button", { name: "Tentar de novo" }),
    ).toBeInTheDocument();
  });
});

describe("Localize um Cursinho — esqueleto (card 04)", () => {
  it("título e texto do mock", async () => {
    await abrir();
    expect(
      screen.getByRole("heading", { level: 1, name: "Localize um Cursinho" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/verifique se este não se encontra em nossa plataforma/),
    ).toBeInTheDocument();
  });

  it("⚠️ já leva ao cadastro (até o 08 trocar pelo modal)", async () => {
    await abrir();
    expect(
      screen.getByRole("link", { name: "Cadastre um novo cursinho" }),
    ).toHaveAttribute("href", "/localiza-cursinho/cadastro");
  });

  it("tem os lugares dos próximos cards", async () => {
    await abrir();
    const slots = [...document.querySelectorAll("[data-slot]")].map((e) =>
      e.getAttribute("data-slot"),
    );
    expect(slots).toEqual([
      "lista",
      "cadastro",
      "busca",
      "mapa",
      "card-do-mapa",
    ]);
  });

  it("no celular o mapa vem primeiro; de 1200px para cima, lado a lado", async () => {
    await abrir();
    const mapa = screen.getByRole("region", { name: "Mapa de cursinhos" });
    expect(mapa.className).toContain("order-1");
    expect(mapa.className).toContain("md:order-2");
    expect(mapa.parentElement?.className).toContain("md:grid-cols-2");
  });
});

describe("Localiza Cursinho — busca rápida (card 06)", () => {
  const buscar = (texto: string) =>
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Pesquisar cursinhos" }),
      {
        target: { value: texto },
      },
    );

  it("com termo: a lista vira os resultados e o mapa mostra só eles", async () => {
    await abrir();
    act(() => controle.onLimites(CAMPINAS));
    buscar("longe");

    expect(
      await screen.findByText('Resultados para "longe" (1)'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Cursinho longe" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Cursinho a" })).toBeNull();
    expect(
      (ultimasProps().markers as { id: string }[]).map((m) => m.id),
    ).toEqual(["longe"]);
  });

  it("um resultado → voa até ele; vários → enquadra todos", async () => {
    await abrir();
    buscar("longe");
    await screen.findByText(/Resultados para "longe"/);
    expect(controle.mapa.flyTo).toHaveBeenCalledWith([-21.0, -47.9], 14);

    buscar("cursinho");
    await screen.findByText(/Resultados para "cursinho"/);
    expect(controle.mapa.fitBounds).toHaveBeenCalled();
  });

  it("⚠️ com termo, mexer no mapa NÃO troca a lista", async () => {
    await abrir();
    buscar("longe");
    await screen.findByText(/Resultados para "longe"/);
    act(() => controle.onLimites(CAMPINAS));
    expect(
      screen.getByRole("heading", { name: "Cursinho longe" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Cursinho a" })).toBeNull();
  });

  it("limpar volta à lista da área visível", async () => {
    await abrir();
    act(() => controle.onLimites(CAMPINAS));
    buscar("longe");
    await screen.findByText(/Resultados para "longe"/);
    buscar("");
    expect(
      await screen.findByRole("heading", { name: "Cursinho a" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Resultados para/)).toBeNull();
  });

  it("sem resultado: aviso e o cadastro ganha destaque", async () => {
    await abrir();
    buscar("xyz");
    expect(
      await screen.findByText('Não encontramos nenhum cursinho com "xyz".'),
    ).toBeInTheDocument();
    expect(
      document
        .querySelector('[data-slot="cadastro"]')
        ?.getAttribute("data-destaque"),
    ).toBe("true");
  });

  it("⚠️ ?q= na URL restaura a busca ao recarregar; digitar atualiza a URL", async () => {
    await abrir("/localiza-cursinho?q=longe");
    expect(screen.getByRole("searchbox")).toHaveValue("longe");
    expect(
      await screen.findByText(/Resultados para "longe"/),
    ).toBeInTheDocument();

    buscar("cursinho b");
    await screen.findByText(/Resultados para "cursinho b"/);
    // A URL é gravada num efeito DEPOIS de os resultados aparecerem.
    await waitFor(() =>
      expect(new URLSearchParams(localAtual.search).get("q")).toBe(
        "cursinho b",
      ),
    );
  });

  it("na busca o filtro de tipo sai de cena", async () => {
    await abrir();
    expect(screen.getByText(/Universidade/i)).toBeInTheDocument();
    buscar("longe");
    await screen.findByText(/Resultados para "longe"/);
    expect(screen.queryByText(/Universidade/i)).toBeNull();
  });
});

describe("Localiza Cursinho — cartão do mapa e reportar (card 07)", () => {
  const cartao = () =>
    screen.queryByRole("dialog", { name: /Cursinho a|Universidade/ });
  const clicarNoPin = (id: string) =>
    act(() => (ultimasProps().onMarkerClick as (id: string) => void)(id));

  it("clique no pin abre o cartão com as informações; sem 'Cadastrar um Cursinho'", async () => {
    await abrir();
    clicarNoPin("a");
    expect(
      await screen.findByRole("dialog", { name: "Cursinho: Cursinho a" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Cadastrar um Cursinho")).toBeNull();
  });

  it("clique no card da lista também abre o cartão", async () => {
    await abrir();
    act(() => controle.onLimites(CAMPINAS));
    fireEvent.click(await screen.findByRole("button", { name: /Cursinho a/ }));
    expect(
      screen.getByRole("dialog", { name: "Cursinho: Cursinho a" }),
    ).toBeInTheDocument();
  });

  it("fecha no ✕, no Esc e no clique no mapa vazio", async () => {
    await abrir();
    clicarNoPin("a");
    fireEvent.click(await screen.findByRole("button", { name: "Fechar" }));
    expect(cartao()).toBeNull();

    clicarNoPin("a");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(cartao()).toBeNull();

    clicarNoPin("a");
    act(() => controle.onCliqueNoMapa());
    expect(cartao()).toBeNull();
  });

  it("⚠️ reportar: cursinho vai como GEO, universidade como COLLEGE; Esc não fecha o cartão por baixo do modal", async () => {
    await abrir();
    clicarNoPin("a");
    fireEvent.click(
      await screen.findByRole("button", { name: "Reportar problema" }),
    );
    expect(screen.getByRole("dialog", { name: "Reportar" })).toHaveTextContent(
      "a|Cursinho",
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.getByRole("dialog", { name: "Cursinho: Cursinho a" }),
    ).toBeInTheDocument();
  });

  it("universidade abre o cartão de universidade e reporta como COLLEGE", async () => {
    await abrir();
    clicarNoPin("unicamp");
    expect(
      await screen.findByRole("dialog", {
        name: "Universidade: Cursinho unicamp",
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reportar problema" }));
    expect(screen.getByRole("dialog", { name: "Reportar" })).toHaveTextContent(
      "unicamp|Universidade",
    );
  });

  it("tem o lugar do botão de confirmação (09) ao lado do ⚠️", async () => {
    await abrir();
    clicarNoPin("a");
    await screen.findByRole("dialog", { name: "Cursinho: Cursinho a" });
    expect(
      document.querySelector('[data-slot="confirmacao-mapa"]'),
    ).toBeTruthy();
  });
});
