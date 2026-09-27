import { describe, expect, it } from "vitest";
import { TypeMarker } from "@/types/map/marker";
import type { PublicGeolocation } from "@/types/geolocation/publicGeolocation";
import { cursinhosNaArea, dentro, formatarData, type Limites } from "./regras";

const geo = (
  id: string,
  lat: number,
  lon: number,
  extra: Partial<PublicGeolocation> = {},
) =>
  ({
    id,
    name: id,
    latitude: lat,
    longitude: lon,
    type: TypeMarker.geo,
    createdAt: "2026-01-01T12:00:00Z",
    ...extra,
  }) as PublicGeolocation;

// Um quadrado em volta de Campinas.
const CAMPINAS: Limites = {
  norte: -22.8,
  sul: -23.0,
  leste: -46.9,
  oeste: -47.2,
};

describe("cursinhosNaArea", () => {
  it("só os que estão dentro da área visível", () => {
    const dentroDaArea = geo("campinas", -22.9, -47.06);
    const fora = geo("sao-carlos", -22.0, -47.9);

    const r = cursinhosNaArea([dentroDaArea, fora], CAMPINAS, 12);

    expect(r.itens.map((g) => g.id)).toEqual(["campinas"]);
    expect(r.total).toBe(1);
  });

  it("⚠️ universidade nunca entra na lista (aparece só no mapa)", () => {
    const univ = geo("unicamp", -22.82, -47.07, {
      type: TypeMarker.univPublic,
    });
    expect(cursinhosNaArea([univ], CAMPINAS, 12).itens).toEqual([]);
  });

  it("limita e conta o total da área (para o 'Mostrando X de Y')", () => {
    const muitos = Array.from({ length: 15 }, (_, i) =>
      geo(`c${i}`, -22.9, -47.06),
    );
    const r = cursinhosNaArea(muitos, CAMPINAS, 12);
    expect(r.itens).toHaveLength(12);
    expect(r.total).toBe(15);
  });

  it("cadastro mais recente primeiro (até o card 03 trazer as confirmações)", () => {
    const antigo = geo("antigo", -22.9, -47.06, {
      createdAt: "2025-01-01T00:00:00Z",
    });
    const novo = geo("novo", -22.9, -47.06, {
      createdAt: "2026-06-01T00:00:00Z",
    });
    expect(
      cursinhosNaArea([antigo, novo], CAMPINAS, 12).itens.map((g) => g.id),
    ).toEqual(["novo", "antigo"]);
  });

  it("sem área ainda (mapa não montou) → lista vazia", () => {
    expect(cursinhosNaArea([geo("x", -22.9, -47.06)], null, 12)).toEqual({
      itens: [],
      total: 0,
    });
  });

  it("borda da área conta como dentro", () => {
    expect(dentro(CAMPINAS, -22.8, -46.9)).toBe(true);
  });
});

describe("formatarData", () => {
  it("dd/MM/yyyy", () => {
    expect(formatarData("2026-09-27T15:00:00Z")).toBe("27/09/2026");
  });
});
