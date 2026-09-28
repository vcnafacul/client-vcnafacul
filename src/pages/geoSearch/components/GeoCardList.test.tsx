import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TypeMarker } from "@/types/map/marker";
import type { PublicGeolocation } from "@/types/geolocation/publicGeolocation";
import { GeoCardList } from "./GeoCardList";

const geo = (id: string, name = id) =>
  ({
    id,
    name,
    state: "SP",
    city: "Campinas",
    latitude: 0,
    longitude: 0,
    type: TypeMarker.geo,
    createdAt: "2026-09-27T15:00:00Z",
  }) as PublicGeolocation;

const props = (extra = {}) => ({
  estado: "pronto" as const,
  itens: [geo("a", "Cursinho A"), geo("b", "Cursinho B")],
  total: 2,
  ativoId: null,
  onFoco: vi.fn(),
  onEscolher: vi.fn(),
  tentarDeNovo: vi.fn(),
  refDoCard: vi.fn(),
  ...extra,
});

describe("GeoCardList", () => {
  it("card com nome, estado, cidade e data de cadastro", () => {
    render(<GeoCardList {...props()} />);
    expect(
      screen.getByRole("heading", { name: "Cursinho A" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Campinas")).toHaveLength(2);
    expect(screen.getAllByText("27/09/2026")).toHaveLength(2);
  });

  it("'Mostrando X de Y' só quando passa do limite", () => {
    const { rerender } = render(<GeoCardList {...props()} />);
    expect(screen.queryByText(/Mostrando/)).toBeNull();
    rerender(<GeoCardList {...props({ total: 48 })} />);
    expect(
      screen.getByText(/Mostrando 2 de 48 cursinhos nesta área/),
    ).toBeInTheDocument();
  });

  it("hover/foco avisa o destaque; clique escolhe", () => {
    const p = props();
    render(<GeoCardList {...p} />);
    const botao = screen.getByRole("button", { name: /Cursinho B/ });
    fireEvent.mouseEnter(botao);
    expect(p.onFoco).toHaveBeenLastCalledWith("b");
    fireEvent.mouseLeave(botao);
    expect(p.onFoco).toHaveBeenLastCalledWith(null);
    fireEvent.click(botao);
    expect(p.onEscolher).toHaveBeenCalledWith("b");
  });

  it("carregando → esqueleto; vazio → aviso; erro → tentar de novo", () => {
    const { rerender } = render(
      <GeoCardList {...props({ estado: "carregando" })} />,
    );
    expect(screen.getByLabelText("Carregando cursinhos")).toBeInTheDocument();

    rerender(<GeoCardList {...props({ itens: [], total: 0 })} />);
    expect(
      screen.getByText("Nenhum cursinho nesta área do mapa."),
    ).toBeInTheDocument();

    const p = props({ estado: "erro" });
    rerender(<GeoCardList {...p} />);
    fireEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));
    expect(p.tentarDeNovo).toHaveBeenCalled();
  });
});
