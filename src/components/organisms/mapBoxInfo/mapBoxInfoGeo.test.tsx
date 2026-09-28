import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { PublicGeolocation } from "@/types/geolocation/publicGeolocation";

vi.mock("../../molecules/mapBox", () => ({ MarkerPin: () => null }));

import MapBoxInfoGeo from "./mapBoxInfoGeo";

const base = {
  name: "Cursinho X",
  street: "Rua A",
  number: "1",
  complement: null,
  neighborhood: "Centro",
  cep: "13000-000",
  city: "Campinas",
  state: "SP",
  phone: null,
  whatsapp: null,
  email: null,
  site: null,
  linkedin: null,
  youtube: null,
  facebook: null,
  instagram: null,
  twitter: null,
  tiktok: null,
} as unknown as PublicGeolocation;

const abrir = (geo: PublicGeolocation, ctaLink?: string) =>
  render(
    <MemoryRouter>
      <MapBoxInfoGeo geo={geo} ctaLink={ctaLink} />
    </MemoryRouter>,
  );

describe("MapBoxInfoGeo", () => {
  it("⚠️ campo vazio (null ou só espaço) não vira ícone de link", () => {
    const { container } = abrir({ ...base, site: "  " });
    expect(container.querySelectorAll("a")).toHaveLength(0);
    expect(container.innerHTML).not.toContain("phone=55null");
  });

  it("com valor, mostra o link certo", () => {
    const { container } = abrir({
      ...base,
      whatsapp: "11999990000",
      site: "https://cursinho.org",
    });
    const hrefs = [...container.querySelectorAll("a")].map((a) =>
      a.getAttribute("href"),
    );
    expect(hrefs).toEqual([
      "https://api.whatsapp.com/send?phone=5511999990000",
      "https://cursinho.org",
    ]);
  });

  it("sem ctaLink não mostra 'Cadastrar um Cursinho'; com ele, mostra (home)", () => {
    const { unmount } = abrir(base);
    expect(screen.queryByText("Cadastrar um Cursinho")).toBeNull();
    unmount();
    abrir(base, "/localiza-cursinho");
    expect(
      screen.getByText("Cadastrar um Cursinho").closest("a"),
    ).toHaveAttribute("href", "/localiza-cursinho");
  });
});
