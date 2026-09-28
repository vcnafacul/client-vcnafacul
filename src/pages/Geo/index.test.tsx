import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../components/templates/baseTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock("../../components/organisms/geoForm", () => ({
  default: ({ nomeInicial }: { nomeInicial?: string }) => (
    <div>nome inicial: {nomeInicial ?? "(nenhum)"}</div>
  ),
}));

import Geo from ".";

const abrir = (state?: unknown) =>
  render(
    <MemoryRouter
      initialEntries={[{ pathname: "/localiza-cursinho/cadastro", state }]}
    >
      <Geo />
    </MemoryRouter>,
  );

describe("cadastro de cursinho — nome vindo da busca (card 08)", () => {
  it("vindo do 'Não encontrei, cadastrar': o nome chega ao formulário", () => {
    abrir({ name: "Cursinho da Vila" });
    expect(
      screen.getByText("nome inicial: Cursinho da Vila"),
    ).toBeInTheDocument();
  });

  it("acesso direto (sem state) funciona como antes", () => {
    abrir();
    expect(screen.getByText("nome inicial: (nenhum)")).toBeInTheDocument();
  });

  it("state estranho não quebra nem vira nome", () => {
    abrir({ name: 42 });
    expect(screen.getByText("nome inicial: (nenhum)")).toBeInTheDocument();
  });
});
