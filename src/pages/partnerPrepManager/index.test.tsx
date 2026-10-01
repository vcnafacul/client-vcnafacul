import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getTodosOsCursinhos = vi.hoisted(() => vi.fn());
vi.mock("@/services/prepCourse/prepCourse/getPartnerPrepCourse", () => ({
  getTodosOsCursinhos,
}));
vi.mock("@/store/auth", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useAuthStore: () => ({ data: { token: "tok" } }),
}));
vi.mock("./modals/ModalShowPrepCourse", () => ({
  ModalShowPrepCourse: ({
    prepCourse,
  }: {
    prepCourse: { geo: { name: string } };
  }) => <div data-testid="detalhe">{prepCourse.geo.name}</div>,
}));
vi.mock("./modals/ModalCreatePrepCourse", () => ({
  ModalCreatePrepCourse: () => null,
}));

import PartnerPrepManager from ".";

const cursinho = (id: string, nome: string, cidade: string) => ({
  id,
  geo: {
    id,
    name: nome,
    city: cidade,
    state: "SP",
    category: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    phone: "",
  },
  representative: { id: "r", name: "Coord", email: "c@x.com", phone: "" },
  number_students: 10,
  number_members: 3,
  createdAt: "2025-01-10T12:00:00.000Z",
  updatedAt: "2026-01-10T12:00:00.000Z",
});

describe("Gerenciamento de Cursinho (V2)", () => {
  beforeEach(() => getTodosOsCursinhos.mockReset());

  it("lista os cursinhos e abre o detalhe do clicado", async () => {
    getTodosOsCursinhos.mockResolvedValue([
      cursinho("1", "Cursinho Esperança", "Campinas"),
      cursinho("2", "Cursinho Futuro", "Santos"),
    ]);
    render(<PartnerPrepManager />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Cursinho Futuro" }),
    );
    expect(screen.getByTestId("detalhe")).toHaveTextContent("Cursinho Futuro");
  });

  it("a busca filtra por nome ou cidade", async () => {
    getTodosOsCursinhos.mockResolvedValue([
      cursinho("1", "Cursinho Esperança", "Campinas"),
      cursinho("2", "Cursinho Futuro", "Santos"),
    ]);
    render(<PartnerPrepManager />);
    await screen.findByText("Cursinho Esperança");
    fireEvent.change(
      screen.getByPlaceholderText("Nome, cidade, UF ou coordenador"),
      {
        target: { value: "santos" },
      },
    );
    await waitFor(() =>
      expect(screen.queryByText("Cursinho Esperança")).toBeNull(),
    );
    expect(screen.getByText("Cursinho Futuro")).toBeInTheDocument();
  });

  it("⚠️ erro na carga mostra 'tentar de novo' (antes a lista ficava vazia calada)", async () => {
    getTodosOsCursinhos
      .mockRejectedValueOnce(new Error("rede"))
      .mockResolvedValue([cursinho("1", "Voltou", "X")]);
    render(<PartnerPrepManager />);
    fireEvent.click(await screen.findByRole("button", { name: /tentar/i }));
    expect(await screen.findByText("Voltou")).toBeInTheDocument();
  });
});
