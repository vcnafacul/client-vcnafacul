import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ID_DA_BUSCA } from "./BuscaCursinhos";
import { ModalNaoEncontrei } from "./ModalNaoEncontrei";

function Cadastro() {
  const estado = useLocation().state as { name?: string } | null;
  return <div>cadastro com nome: {estado?.name ?? "(vazio)"}</div>;
}

function montar(termo: string, onFechar = vi.fn()) {
  render(
    <MemoryRouter initialEntries={["/localiza-cursinho"]}>
      <input id={ID_DA_BUSCA} aria-label="busca" />
      <Routes>
        <Route
          path="/localiza-cursinho"
          element={
            <ModalNaoEncontrei aberto termo={termo} onFechar={onFechar} />
          }
        />
        <Route path="/localiza-cursinho/cadastro" element={<Cadastro />} />
      </Routes>
    </MemoryRouter>,
  );
  return onFechar;
}

describe("ModalNaoEncontrei (card 08)", () => {
  it("com termo: mostra o termo, e cadastrar leva o nome ao formulário", async () => {
    montar("  cursinho da vila ");
    expect(
      screen.getByRole("dialog", { name: "Você não encontrou o cursinho?" }),
    ).toBeInTheDocument();
    expect(screen.getByText('"cursinho da vila"')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Não encontrei, cadastrar" }),
    );
    expect(
      await screen.findByText("cadastro com nome: cursinho da vila"),
    ).toBeInTheDocument();
  });

  it("sem termo: não mostra 'Você buscou por', e o cadastro vai sem nome", async () => {
    montar("");
    expect(screen.queryByText(/Você buscou por/)).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Não encontrei, cadastrar" }),
    );
    expect(
      await screen.findByText("cadastro com nome: (vazio)"),
    ).toBeInTheDocument();
  });

  it("'Voltar e buscar de novo' fecha", () => {
    const onFechar = montar("x");
    fireEvent.click(
      screen.getByRole("button", { name: "Voltar e buscar de novo" }),
    );
    expect(onFechar).toHaveBeenCalled();
  });
});
