import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TabHistoricoRefactored } from "./TabHistoricoRefactored";

const getLogs = vi.hoisted(() => vi.fn());
vi.mock("@/services/question/getLogs", () => ({ getLogs }));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));
vi.mock("@/hooks/useToastAsync", () => ({
  useToastAsync:
    () =>
    async ({
      action,
      onSuccess,
      onFinally,
    }: {
      action: () => Promise<unknown>;
      onSuccess: (d: unknown) => void;
      onFinally: () => void;
    }) => {
      onSuccess(await action());
      onFinally();
    },
}));

const log = (nome: string, changes: object) => ({
  createdAt: "2026-09-01T12:00:00.000Z",
  user: { name: nome, email: `${nome.toLowerCase()}@exemplo.org` },
  changes: JSON.stringify(changes),
});

describe("TabHistoricoRefactored (Timeline)", () => {
  it("lista um evento por registro, com quem, quantas alterações e a data", async () => {
    getLogs.mockResolvedValue([
      log("Ana", { status: 1 }),
      log("Bia", { a: 1, b: 2, c: 3, d: 4, e: 5 }),
    ]);
    render(<TabHistoricoRefactored questionId="q1" />);
    const lista = await screen.findByRole("list", {
      name: "Histórico de alterações da questão",
    });
    const itens = within(lista).getAllByRole("listitem");
    expect(itens).toHaveLength(2);
    expect(itens[0]).toHaveTextContent("Ana 1 alteração");
    expect(itens[0]).toHaveTextContent("01/09/2026");
    expect(itens[1]).toHaveTextContent("Bia 5 alterações");
  });

  it("mostra só 3 alterações e expande com 'Mostrar mais'", async () => {
    getLogs.mockResolvedValue([log("Bia", { a: 1, b: 2, c: 3, d: 4, e: 5 })]);
    render(<TabHistoricoRefactored questionId="q1" />);
    fireEvent.click(await screen.findByRole("button", { name: /Mostrar mais 2 alterações/ }));
    expect(screen.getByRole("button", { name: /Mostrar menos/ })).toBeInTheDocument();
  });

  it("sem registros mostra o vazio", async () => {
    getLogs.mockResolvedValue([]);
    render(<TabHistoricoRefactored questionId="q1" />);
    expect(await screen.findByText("Nenhum histórico encontrado")).toBeInTheDocument();
  });
});
