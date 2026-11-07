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

  it("os filtros vão para o servidor (o texto espera a digitação parar)", async () => {
    getTodasAsGeolocalizacoes.mockResolvedValue([geo("1", "Cursinho A")]);
    render(<DashGeo />);
    await screen.findByText("Cursinho A");
    fireEvent.change(screen.getByLabelText("Buscar"), {
      target: { value: "semear" },
    });
    fireEvent.change(screen.getByLabelText("Estado"), {
      target: { value: "SP" },
    });
    fireEvent.click(screen.getByLabelText("Endereço"));
    await waitFor(() =>
      expect(getTodasAsGeolocalizacoes).toHaveBeenLastCalledWith(
        "tok",
        expect.objectContaining({
          texto: "semear",
          uf: "SP",
          revisoes: ["reportAddress"],
        }),
      ),
    );
    expect(
      screen.getByRole("button", { name: /Limpar filtros \(3\)/ }),
    ).toBeInTheDocument();
  });

  it("universidade desliga o tipo de cursinho e limpa o que estava escolhido", async () => {
    getTodasAsGeolocalizacoes.mockResolvedValue([]);
    render(<DashGeo />);
    fireEvent.change(await screen.findByLabelText("Tipo de cursinho"), {
      target: { value: "Gratuito" },
    });
    fireEvent.change(screen.getByLabelText("Tipo"), { target: { value: "1" } });
    const categoria = screen.getByLabelText("Tipo de cursinho");
    expect(categoria).toBeDisabled();
    expect(categoria).toHaveValue("");
  });

  it("no celular, 'Mais filtros' mostra quantos filtros estão escondidos", async () => {
    getTodasAsGeolocalizacoes.mockResolvedValue([]);
    render(<DashGeo />);
    fireEvent.change(await screen.findByLabelText("Estado"), {
      target: { value: "SP" },
    });
    const botao = screen.getByRole("button", { name: "Mais filtros (1)" });
    expect(botao).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(botao);
    expect(
      screen.getByRole("button", { name: "Menos filtros (1)" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("status 'Todos' manda -1", async () => {
    getTodasAsGeolocalizacoes.mockResolvedValue([]);
    render(<DashGeo />);
    fireEvent.change(await screen.findByLabelText("Status"), {
      target: { value: "-1" },
    });
    await waitFor(() =>
      expect(getTodasAsGeolocalizacoes).toHaveBeenLastCalledWith(
        "tok",
        expect.objectContaining({ status: -1 }),
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
