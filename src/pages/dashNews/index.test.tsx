import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getTodasAsNovidades = vi.hoisted(() => vi.fn());
vi.mock("../../services/news/getAllNews", () => ({ getTodasAsNovidades }));
vi.mock("../../store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
// O modal de edição não interessa aqui.
vi.mock("./modals/modalEditNew", () => ({
  default: () => <div data-testid="modal-novidade" />,
}));

import DashNews from ".";
import { dataDeExpiracao } from "./columns";

const novidade = (id: string, title: string, over = {}) => ({
  id,
  title,
  actived: true,
  destaque: false,
  contentType: "text",
  fileName: null,
  createdAt: new Date(2026, 8, 1),
  ...over,
});

describe("DashNews (V2)", () => {
  beforeEach(() => {
    getTodasAsNovidades.mockReset();
  });

  it("lista as novidades com título, destaque e status", async () => {
    getTodasAsNovidades.mockResolvedValue([
      novidade("1", "Inscrições abertas", { destaque: true }),
      novidade("2", "Novo simulado"),
    ]);
    render(<DashNews />);
    expect(await screen.findByText("Inscrições abertas")).toBeInTheDocument();
    expect(screen.getByText("Novo simulado")).toBeInTheDocument();
    expect(screen.getByText("Destaque")).toBeInTheDocument();
    expect(screen.getAllByText("Ativa").length).toBeGreaterThan(0);
  });

  it("a busca filtra pelo título", async () => {
    getTodasAsNovidades.mockResolvedValue([
      novidade("1", "Inscrições abertas"),
      novidade("2", "Novo simulado"),
    ]);
    render(<DashNews />);
    await screen.findByText("Inscrições abertas");
    fireEvent.change(screen.getByPlaceholderText("Buscar por título"), {
      target: { value: "simul" },
    });
    await waitFor(() =>
      expect(screen.queryByText("Inscrições abertas")).toBeNull(),
    );
    expect(screen.getByText("Novo simulado")).toBeInTheDocument();
  });

  it("erro na carga mostra 'tentar de novo', que recarrega", async () => {
    getTodasAsNovidades
      .mockRejectedValueOnce(new Error("rede"))
      .mockResolvedValue([novidade("1", "Voltou")]);
    render(<DashNews />);
    fireEvent.click(await screen.findByRole("button", { name: /tentar/i }));
    expect(await screen.findByText("Voltou")).toBeInTheDocument();
  });
});

describe("dataDeExpiracao", () => {
  it("⚠️ lê YYYY-MM-DD em horário local (new Date() mostraria o dia anterior)", () => {
    const d = dataDeExpiracao("2026-10-05")!;
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 9, 5]);
    expect(dataDeExpiracao(null)).toBeNull();
  });
});
