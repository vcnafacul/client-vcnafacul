import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

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

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.scrollIntoView ??= () => {};
});

/** O `sm` do projeto é 768px; o jsdom não tem `matchMedia`. */
function larguraDeTela(acimaDeSm: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      media: query,
      matches: query === "(min-width: 768px)" ? acimaDeSm : !acimaDeSm,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

/** Select do Radix (poucas opções): abre pelo teclado, como no `options-select.test`. */
function escolherNoSelect(rotulo: string, opcao: string) {
  fireEvent.keyDown(screen.getByRole("combobox", { name: rotulo }), {
    key: "Enter",
  });
  fireEvent.click(screen.getByRole("option", { name: opcao }));
}

/** Combobox (lista longa, como os estados): abre no clique. */
function escolherNoCombobox(rotulo: string, opcao: string) {
  fireEvent.click(screen.getByRole("combobox", { name: rotulo }));
  fireEvent.click(screen.getByText(opcao));
}

describe("DashGeo (V2)", () => {
  beforeEach(() => {
    getTodasAsGeolocalizacoes.mockReset();
    larguraDeTela(true);
  });

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
    fireEvent.change(screen.getByLabelText("Nome, sigla ou campus"), {
      target: { value: "semear" },
    });
    escolherNoCombobox("Estado", "São Paulo");
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
    await screen.findByRole("combobox", { name: "Tipo de cursinho" });
    escolherNoSelect("Tipo de cursinho", "Gratuito");
    expect(
      screen.getByRole("combobox", { name: "Tipo de cursinho" }),
    ).toHaveTextContent("Gratuito");
    escolherNoSelect("Tipo", "Universidade");
    const categoria = screen.getByRole("combobox", { name: "Tipo de cursinho" });
    expect(categoria).toBeDisabled();
    expect(categoria).toHaveTextContent("Todos");
  });

  it("no celular, 'Mais filtros' mostra quantos filtros estão escondidos", async () => {
    getTodasAsGeolocalizacoes.mockResolvedValue([]);
    larguraDeTela(false);
    render(<DashGeo />);
    // Recolhido: só a busca está à mostra (D22).
    const botaoFechado = await screen.findByRole("button", { name: "Mais filtros" });
    expect(screen.getByLabelText("Nome, sigla ou campus")).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Estado" })).toBeNull();
    fireEvent.click(botaoFechado);
    escolherNoCombobox("Estado", "São Paulo");
    const botao = screen.getByRole("button", { name: "Menos filtros (1)" });
    expect(botao).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(botao);
    expect(
      screen.getByRole("button", { name: "Mais filtros (1)" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("status 'Todos' manda -1", async () => {
    getTodasAsGeolocalizacoes.mockResolvedValue([]);
    render(<DashGeo />);
    await screen.findByRole("combobox", { name: "Status" });
    escolherNoSelect("Status", "Todos");
    await waitFor(() =>
      expect(getTodasAsGeolocalizacoes).toHaveBeenLastCalledWith(
        "tok",
        expect.objectContaining({ status: -1 }),
      ),
    );
  });

  it("o título da lista é o h1 da página", async () => {
    getTodasAsGeolocalizacoes.mockResolvedValue([]);
    render(<DashGeo />);
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Validação Localiza Cursinho",
      }),
    ).toBeInTheDocument();
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
