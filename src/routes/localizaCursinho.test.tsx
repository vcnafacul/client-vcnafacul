import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { rotasDoLocalizaCursinho } from "./localizaCursinhoRoutes";
import { GEOLOCATION_REGISTER, GEOLOCATION_SEARCH } from "./path";

vi.mock("../pages/Geo", () => ({ default: () => <div>tela do cadastro</div> }));

const abrir = (caminho: string) =>
  render(
    <MemoryRouter initialEntries={[caminho]}>
      <Routes>
        {rotasDoLocalizaCursinho()}
        <Route path="*" element={<div>não encontrada</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe("rota do Localiza Cursinho (tickets/022, card 10)", () => {
  it("os caminhos são /localiza-cursinho e /localiza-cursinho/cadastro", () => {
    expect(GEOLOCATION_SEARCH).toBe("/localiza-cursinho");
    expect(GEOLOCATION_REGISTER).toBe("/localiza-cursinho/cadastro");
  });

  it("/localiza-cursinho abre a tela (o cadastro, até o card 04)", () => {
    abrir("/localiza-cursinho");
    expect(screen.getByText("tela do cadastro")).toBeInTheDocument();
  });

  it("/localiza-cursinho/cadastro abre o cadastro", () => {
    abrir("/localiza-cursinho/cadastro");
    expect(screen.getByText("tela do cadastro")).toBeInTheDocument();
  });

  it("⚠️ /geolocation não é mais rota da tela (sem redirecionamento, decisão do card)", () => {
    abrir("/geolocation");
    expect(screen.getByText("não encontrada")).toBeInTheDocument();
  });
});
