import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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
  mapa: { flyTo: vi.fn() },
}));
vi.mock("./components/MapaController", () => ({
  MapaController: ({
    onLimites,
    onMapa,
  }: {
    onLimites: (l: Limites) => void;
    onMapa: (m: unknown) => void;
  }) => {
    controle.onLimites = onLimites;
    onMapa(controle.mapa);
    return null;
  },
}));

const api = vi.hoisted(() => ({ buscarGeoPublico: vi.fn() }));
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

async function abrir() {
  render(
    <MemoryRouter>
      <GeoSearch />
    </MemoryRouter>,
  );
  await screen.findByTestId("mapa");
  await act(async () => {});
}
const ultimasProps = () => mapBox.props[mapBox.props.length - 1];

beforeEach(() => {
  mapBox.props = [];
  controle.mapa.flyTo.mockClear();
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

    expect(controle.mapa.flyTo).toHaveBeenCalledWith([-22.95, -47.1], 14);
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
