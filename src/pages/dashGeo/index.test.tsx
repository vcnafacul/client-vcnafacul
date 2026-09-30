import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getTodasAsGeolocalizacoes = vi.hoisted(() => vi.fn());
vi.mock("../../services/geolocation/getAllGeolocation", () => ({
  getTodasAsGeolocalizacoes,
}));
vi.mock("@/store/auth", async (importOriginal) => ({
  // Mantém os outros exports (ex.: Gender) usados por arquivos importados.
  ...(await importOriginal<object>()),
  useAuthStore: (sel?: (s: unknown) => unknown) => {
    const s = { data: { token: "tok" } };
    return sel ? sel(s) : s;
  },
}));
vi.mock("@/hooks/useToastAsync", () => ({ useToastAsync: () => vi.fn() }));
vi.mock("./modals/modalEditDashGeo", () => ({ default: () => null }));
vi.mock("./modals/modalCreateDashGeo", () => ({ default: () => null }));

import DashGeo from ".";
import { relatos } from "./columns";

const geo = (id: string, name: string, over = {}) => ({
  id,
  name,
  status: 0,
  type: 0,
  city: "Campinas",
  state: "SP",
  createdAt: "2026-09-01T12:00:00.000Z",
  updatedAt: "2026-09-02T12:00:00.000Z",
  reportAddress: false,
  reportContact: false,
  reportOther: false,
  logs: [],
  ...over,
});

describe("DashGeo (V2)", () => {
  beforeEach(() => getTodasAsGeolocalizacoes.mockReset());

  it("lista com nome, status e o selo de relatos", async () => {
    getTodasAsGeolocalizacoes.mockResolvedValue([
      geo("1", "Cursinho A", { reportAddress: true, reportOther: true }),
      geo("2", "Cursinho B"),
    ]);
    render(<DashGeo />);
    expect(await screen.findByText("Cursinho A")).toBeInTheDocument();
    expect(screen.getByText("Cursinho B")).toBeInTheDocument();
    expect(screen.getByText("2 relato(s)")).toBeInTheDocument();
  });

  it("a busca vai para o servidor", async () => {
    getTodasAsGeolocalizacoes.mockResolvedValue([geo("1", "Cursinho A")]);
    render(<DashGeo />);
    await screen.findByText("Cursinho A");
    fireEvent.change(
      screen.getByPlaceholderText("Nome, estado, cidade, email ou categoria"),
      { target: { value: "campinas" } },
    );
    await waitFor(() =>
      expect(getTodasAsGeolocalizacoes).toHaveBeenLastCalledWith(
        "tok",
        expect.anything(),
        "campinas",
      ),
    );
  });

  it("erro na carga mostra 'tentar de novo', que recarrega", async () => {
    getTodasAsGeolocalizacoes
      .mockRejectedValueOnce(new Error("rede"))
      .mockResolvedValue([geo("1", "Voltou")]);
    render(<DashGeo />);
    fireEvent.click(await screen.findByRole("button", { name: /tentar/i }));
    expect(await screen.findByText("Voltou")).toBeInTheDocument();
  });
});

describe("relatos", () => {
  it("conta os problemas reportados", () => {
    expect(
      relatos({ reportAddress: true, reportContact: false, reportOther: true }),
    ).toBe(2);
    expect(
      relatos({
        reportAddress: false,
        reportContact: false,
        reportOther: false,
      }),
    ).toBe(0);
  });
});
