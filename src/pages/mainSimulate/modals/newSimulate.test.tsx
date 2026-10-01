import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TipoSimulados } from "../../../enums/simulado/tipoSimulados";
import NewSimulate from "./newSimulate";

const getAvailable = vi.fn();
vi.mock("../../../services/simulado/getAvailable", () => ({
  getAvailable: (...args: unknown[]) => getAvailable(...args),
}));
vi.mock("../../../services/simulado/getSimuladoById", () => ({
  getSimuladoById: vi.fn(),
}));
vi.mock("../../../store/auth", () => ({
  useAuthStore: () => ({ data: { token: "t" } }),
}));
vi.mock("../../../store/simulado", () => ({
  useSimuladoStore: () => ({ simuladoBegin: vi.fn() }),
}));
vi.mock("react-toastify", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const abrir = () =>
  render(
    <MemoryRouter>
      <NewSimulate
        title={TipoSimulados.Matematica}
        isOpen
        handleClose={() => {}}
      />
    </MemoryRouter>,
  );

describe("NewSimulate", () => {
  beforeEach(() => getAvailable.mockReset());

  it("sem simulado disponível, diz isso em vez de só apagar o botão", async () => {
    getAvailable.mockResolvedValue([]);
    abrir();

    expect(
      await screen.findByText("Nenhum simulado disponível no momento."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ok, vamos lá!" })).toBeDisabled();
  });

  it("com simulado disponível, mostra o seletor e não o aviso", async () => {
    getAvailable.mockResolvedValue([{ _id: "1", nome: "Matemática 2025" }]);
    abrir();

    expect(await screen.findByRole("combobox")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Ok, vamos lá!" }),
      ).toBeEnabled(),
    );
    expect(
      screen.queryByText("Nenhum simulado disponível no momento."),
    ).not.toBeInTheDocument();
  });
});
