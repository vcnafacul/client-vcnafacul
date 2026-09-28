import { act, render, waitFor } from "@testing-library/react";
import type { Map as LeafletMap } from "leaflet";
import { useMap } from "react-leaflet";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TypeMarker } from "@/types/map/marker";
import MapBox from ".";

/*
  Leaflet de verdade no jsdom (sem tiles). Cobre as props opcionais que o
  Localiza Cursinho acrescentou (tickets/022, card 05) — a home não as usa.
*/
const markers = [
  { id: "norte", lat: -10, lon: -50, type: TypeMarker.geo },
  { id: "sul", lat: -30, lon: -50, type: TypeMarker.univPublic },
];

// jsdom não mede nada: sem tamanho, o markercluster acha que nada está na
// área visível e não põe nenhum pin na tela.
Object.defineProperty(HTMLElement.prototype, "clientWidth", {
  configurable: true,
  get: () => 800,
});
Object.defineProperty(HTMLElement.prototype, "clientHeight", {
  configurable: true,
  get: () => 600,
});

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: { getCurrentPosition: (_: unknown, erro: () => void) => erro() },
  });
});

async function montar(
  props: Partial<React.ComponentProps<typeof MapBox>> = {},
) {
  const r = render(<MapBox markers={markers} zoom={3} {...props} />);
  await waitFor(() =>
    expect(
      r.container.querySelectorAll(".leaflet-marker-icon").length,
    ).toBeGreaterThan(0),
  );
  return r;
}

const pinDe = (container: HTMLElement, titulo: string) =>
  container.querySelector(
    `.leaflet-marker-icon[title="${titulo}"]`,
  ) as HTMLElement;

describe("MapBox — props opcionais do Localiza Cursinho", () => {
  it("onMarkerClick recebe o ID do pin clicado", async () => {
    const onMarkerClick = vi.fn();
    const { container } = await montar({ onMarkerClick });

    act(() => pinDe(container, "Universidade pública").click());

    expect(onMarkerClick).toHaveBeenCalledWith("sul");
  });

  it("handleClickMarker (o da home) continua recebendo o índice", async () => {
    const handleClickMarker = vi.fn();
    const { container } = await montar({ handleClickMarker });
    act(() => pinDe(container, "Universidade pública").click());
    expect(handleClickMarker).toHaveBeenCalledWith(1);
  });

  it("activeId destaca o pin, e trocar tira o destaque do anterior", async () => {
    const { container, rerender } = await montar({ activeId: "norte" });
    expect(pinDe(container, "Cursinho popular").classList).toContain(
      "pin-ativo",
    );

    rerender(<MapBox markers={markers} zoom={3} activeId="sul" />);
    await waitFor(() =>
      expect(pinDe(container, "Universidade pública").classList).toContain(
        "pin-ativo",
      ),
    );
    expect(pinDe(container, "Cursinho popular").classList).not.toContain(
      "pin-ativo",
    );
  });

  it("⚠️ sem a prop, fica como a home: zoom pela roda DESLIGADO", async () => {
    let mapa: LeafletMap | undefined;
    const Pegar = () => {
      mapa = useMap();
      return null;
    };
    const home = await montar({ mapEvent: <Pegar /> });
    expect(mapa!.scrollWheelZoom.enabled()).toBe(false);
    home.unmount();

    await montar({ mapEvent: <Pegar />, scrollWheelZoom: true });
    expect(mapa!.scrollWheelZoom.enabled()).toBe(true);
  });

  it("⚠️ pin escolhido dentro de um cluster ganha o destaque ao aparecer", async () => {
    const perto = [
      { id: "a", lat: -22.9, lon: -47.06, type: TypeMarker.geo },
      { id: "b", lat: -22.91, lon: -47.07, type: TypeMarker.geo },
    ];
    let mapa: LeafletMap | undefined;
    const Pegar = () => {
      mapa = useMap();
      return null;
    };
    const { container } = render(
      <MapBox
        markers={perto}
        zoom={3}
        center={[-22.9, -47.06]}
        activeId="a"
        mapEvent={<Pegar />}
      />,
    );
    // Longe: os dois estão num cluster, sem pin individual na tela.
    await waitFor(() =>
      expect(container.querySelector(".leaflet-marker-icon")).toBeTruthy(),
    );
    expect(container.querySelector(".pin-ativo")).toBeNull();

    // Perto: o cluster se desfaz e o pin escolhido nasce destacado.
    act(() => mapa!.setView([-22.9, -47.06], 14, { animate: false }));
    await waitFor(() =>
      expect(container.querySelector(".pin-ativo")).toBeTruthy(),
    );
  });
});
