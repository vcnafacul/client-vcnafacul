import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

// O header/footer da plataforma não é o assunto aqui.
vi.mock("../../components/templates/baseTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

import GeoSearch from ".";

const abrir = () =>
  render(
    <MemoryRouter>
      <GeoSearch />
    </MemoryRouter>,
  );

describe("Localiza Cursinho — esqueleto (tickets/022, card 04)", () => {
  it("título e texto do mock", () => {
    abrir();
    expect(
      screen.getByRole("heading", { level: 1, name: "Localize um Cursinho" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/verifique se este não se encontra em nossa plataforma/),
    ).toBeInTheDocument();
  });

  it("⚠️ já leva ao cadastro (até o 08 trocar pelo modal)", () => {
    abrir();
    expect(
      screen.getByRole("link", { name: "Cadastre um novo cursinho" }),
    ).toHaveAttribute("href", "/localiza-cursinho/cadastro");
  });

  it("tem os lugares dos próximos cards", () => {
    const { container } = abrir();
    const slots = [...container.querySelectorAll("[data-slot]")].map((e) =>
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

  it("no celular o mapa vem primeiro; de 1200px para cima, lado a lado", () => {
    abrir();
    const mapa = screen.getByRole("region", { name: "Mapa de cursinhos" });
    expect(mapa.className).toContain("order-1");
    expect(mapa.className).toContain("md:order-2");
    expect(mapa.parentElement?.className).toContain("md:grid-cols-2");
  });
});
