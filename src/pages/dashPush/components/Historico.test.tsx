import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ listarEnvios: vi.fn() }));
vi.mock("@/services/push/admin", () => api);
vi.mock("@/services/roles/getRoles", () => ({
  getRoles: vi.fn(async () => ({ data: [{ id: "r1", name: "Coordenador" }] })),
}));

import { Historico, POR_PAGINA } from "./Historico";

const envio = (i: number) => ({
  id: `e${i}`,
  title: `Envio ${i}`,
  body: "b",
  url: null,
  audience: { type: "all" },
  status: "done",
  targetUsers: 1,
  targetDevices: 1,
  successCount: 5,
  failureCount: 1,
  createdAt: "2026-09-27T12:00:00Z",
  finishedAt: "2026-09-27T12:00:02Z",
  sentBy: i % 2 ? { id: "u", name: "Fernando" } : null,
});

describe("Historico", () => {
  it("lista com público, autor, status e entregues/falhas; pagina", async () => {
    api.listarEnvios.mockImplementation(async (_t, page) => ({
      data: page === 1 ? [envio(1), envio(2)] : [envio(3)],
      page,
      limit: POR_PAGINA,
      totalItems: POR_PAGINA + 1,
    }));
    render(<Historico />);

    expect(await screen.findByText("Envio 1")).toBeInTheDocument();
    expect(screen.getByText("Fernando")).toBeInTheDocument();
    expect(screen.getByText("Sistema")).toBeInTheDocument();
    expect(screen.getAllByText("Todos")).toHaveLength(2);
    expect(screen.getAllByText("5 / 1")).toHaveLength(2);
    expect(screen.getByText("Página 1 de 2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));
    expect(await screen.findByText("Envio 3")).toBeInTheDocument();
    expect(api.listarEnvios).toHaveBeenLastCalledWith(
      expect.any(String),
      2,
      POR_PAGINA,
    );
  });

  it("público por função mostra o NOME da função, não o id", async () => {
    api.listarEnvios.mockResolvedValue({
      data: [
        { ...envio(1), audience: { type: "roles", roleIds: ["r1"] } },
        { ...envio(2), audience: { type: "roles", roleIds: ["sumiu"] } },
      ],
      page: 1,
      limit: POR_PAGINA,
      totalItems: 2,
    });
    render(<Historico />);
    expect(await screen.findByText("Funções: Coordenador")).toBeInTheDocument();
    expect(screen.getByText("Funções: função removida")).toBeInTheDocument();
  });

  it("sem envios → mensagem vazia", async () => {
    api.listarEnvios.mockResolvedValue({
      data: [],
      page: 1,
      limit: 20,
      totalItems: 0,
    });
    render(<Historico />);
    expect(
      await screen.findByText("Nenhuma notificação enviada ainda."),
    ).toBeInTheDocument();
  });
});
