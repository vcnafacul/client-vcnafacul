import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CollaboratorColumns } from ".";
import {
  ListaDeColaboradoresMobile,
  TAMANHO_DA_PAGINA,
} from "./ListaDeColaboradoresMobile";

const colaborador = (i: number, ativo = true): CollaboratorColumns =>
  ({
    id: `id-${i}`,
    userId: `user-${i}`,
    name: `Pessoa ${i}`,
    email: `pessoa${i}@x.com`,
    phone: "",
    photo: i === 1 ? "collaborators/foto.png" : "",
    actived: ativo,
    role: { id: "r", name: i === 2 ? "Coordenação" : "Professor" },
  }) as unknown as CollaboratorColumns;

const renderLista = (lista: CollaboratorColumns[], onVer = vi.fn()) => {
  render(
    <ListaDeColaboradoresMobile
      colaboradores={lista}
      fotos={{ "collaborators/foto.png": "blob:foto" }}
      onVer={onVer}
    />,
  );
  return onVer;
};

describe("ListaDeColaboradoresMobile", () => {
  it("mostra nome, email, função, status e foto; o card abre o colaborador", () => {
    const onVer = renderLista([colaborador(1), colaborador(3, false)]);
    expect(screen.getByText("Pessoa 1")).toBeInTheDocument();
    expect(screen.getByText("pessoa1@x.com")).toBeInTheDocument();
    expect(screen.getByText("Ativo")).toBeInTheDocument();
    expect(screen.getByText("Inativo")).toBeInTheDocument();
    expect(document.querySelector('img[src="blob:foto"]')).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Ver Pessoa 3" }));
    expect(onVer).toHaveBeenCalledWith("id-3");
  });

  it("busca por nome, email ou função", () => {
    renderLista([colaborador(1), colaborador(2), colaborador(3)]);
    const busca = screen.getByLabelText("Buscar colaborador");
    fireEvent.change(busca, { target: { value: "coordena" } });
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Pessoa 2")).toBeInTheDocument();
    fireEvent.change(busca, { target: { value: "ninguém" } });
    expect(screen.getByText("Nenhum colaborador encontrado")).toBeInTheDocument();
  });

  it("mostra uma página por vez e carrega mais", () => {
    renderLista(
      Array.from({ length: TAMANHO_DA_PAGINA + 2 }, (_, i) => colaborador(i + 1)),
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(TAMANHO_DA_PAGINA);
    fireEvent.click(screen.getByText(/Mostrar mais \(2 restantes\)/));
    expect(screen.getAllByRole("listitem")).toHaveLength(TAMANHO_DA_PAGINA + 2);
  });
});
