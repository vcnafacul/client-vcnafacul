import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getExMembros = vi.hoisted(() => vi.fn());
vi.mock("@/services/prepCourse/collaborator/get-ex-membros", () => ({
  getExMembros,
}));
vi.mock("@/services/prepCourse/collaborator/get-photo", () => ({
  getPhotoCollaborator: vi.fn().mockRejectedValue(new Error("sem foto")),
}));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));

import { ListaDeExMembros, POR_PAGINA } from "./ListaDeExMembros";

const membro = (over = {}) => ({
  id: "c1",
  nome: "Cai Lima",
  foto: null,
  entrada: "2025-02-01T12:00:00Z",
  saida: "2026-06-01T12:00:00Z",
  funcaoQueTinha: "Professor",
  funcaoDada: "Revisor",
  excluidoPor: "Gestor G",
  ...over,
});

beforeEach(() => {
  getExMembros.mockReset();
});

describe("ListaDeExMembros", () => {
  it("mostra cada ex-membro com datas, funções e quem excluiu", async () => {
    getExMembros.mockResolvedValue({
      data: [membro()],
      totalItems: 1,
      page: 1,
      limit: POR_PAGINA,
    });
    render(<ListaDeExMembros />);

    expect(await screen.findByText("Cai Lima")).toBeInTheDocument();
    expect(screen.getByText(/01\/02\/2025 → 01\/06\/2026/)).toBeInTheDocument();
    expect(screen.getByText(/excluído por Gestor G/)).toBeInTheDocument();
    expect(screen.getByText("Professor")).toBeInTheDocument();
    expect(screen.getByText("Revisor")).toBeInTheDocument();
    expect(getExMembros).toHaveBeenCalledWith("tok", 1, POR_PAGINA);
  });

  it("vazio explica de onde vêm os ex-membros", async () => {
    getExMembros.mockResolvedValue({ data: [], totalItems: 0, page: 1, limit: 20 });
    render(<ListaDeExMembros />);
    expect(await screen.findByText(/Nenhum ex-membro/)).toBeInTheDocument();
  });

  it("pagina", async () => {
    getExMembros.mockResolvedValue({
      data: [membro()],
      totalItems: POR_PAGINA + 1,
      page: 1,
      limit: POR_PAGINA,
    });
    render(<ListaDeExMembros />);
    fireEvent.click(await screen.findByRole("button", { name: "Próxima" }));
    await waitFor(() =>
      expect(getExMembros).toHaveBeenLastCalledWith("tok", 2, POR_PAGINA),
    );
  });

  it("erro ao carregar", async () => {
    getExMembros.mockImplementation(() => Promise.reject(new Error("x")));
    render(<ListaDeExMembros />);
    expect(
      await screen.findByText("Não foi possível carregar os ex-membros."),
    ).toBeInTheDocument();
  });
});
