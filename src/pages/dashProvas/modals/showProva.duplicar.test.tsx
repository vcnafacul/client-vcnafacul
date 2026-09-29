import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const svc = vi.hoisted(() => ({ getProvaById: vi.fn() }));
vi.mock("../../../services/prova/getProvaById", () => ({
  getProvaById: svc.getProvaById,
}));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn(), loading: vi.fn(), update: vi.fn() },
}));
vi.mock("@/components/templates/modalTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("./simuladosView", () => ({ default: () => null }));

import ShowProva from "./showProva";

const PROVA = {
  _id: "p2",
  nome: "Simulado Espanhol",
  totalQuestao: 90,
  totalQuestaoCadastradas: 90,
  totalQuestaoValidadas: 90,
} as never;

describe("ShowProva — duplicar (027 · 03)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("⚠️ sem a prop (dashProvas, admin): não há botão", async () => {
    svc.getProvaById.mockResolvedValue({});
    render(<ShowProva prova={PROVA} isOpen handleClose={vi.fn()} />);
    await waitFor(() => expect(svc.getProvaById).toHaveBeenCalled());
    expect(screen.queryByRole("button", { name: "Duplicar prova" })).toBeNull();
  });

  it("com a prop: botão chama a ação; sem permissão fica desabilitado com o motivo", async () => {
    svc.getProvaById.mockResolvedValue({});
    const aoClicar = vi.fn();
    const { rerender } = render(
      <ShowProva
        prova={PROVA}
        isOpen
        handleClose={vi.fn()}
        duplicar={{ permitido: true, aoClicar }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Duplicar prova" }));
    expect(aoClicar).toHaveBeenCalled();

    rerender(
      <ShowProva
        prova={PROVA}
        isOpen
        handleClose={vi.fn()}
        duplicar={{ permitido: false, motivo: "Requer permissão", aoClicar }}
      />,
    );
    const botao = screen.getByRole("button", { name: "Duplicar prova" });
    expect(botao).toBeDisabled();
    expect(botao).toHaveAttribute("title", "Requer permissão");
  });

  it("prova duplicada mostra de qual veio", async () => {
    svc.getProvaById.mockImplementation(async (id: string) =>
      id === "p2" ? { provaOrigemId: "p1" } : { nome: "Simulado Inglês" },
    );
    render(<ShowProva prova={PROVA} isOpen handleClose={vi.fn()} />);
    expect(await screen.findByText("Simulado Inglês")).toBeInTheDocument();
    expect(screen.getByText(/Duplicada de/)).toBeInTheDocument();
    expect(svc.getProvaById).toHaveBeenCalledWith("p1", "tok");
  });

  it("origem que não carrega: 'outra prova'", async () => {
    svc.getProvaById.mockImplementation(async (id: string) => {
      if (id === "p2") return { provaOrigemId: "p1" };
      throw new Error("404");
    });
    render(<ShowProva prova={PROVA} isOpen handleClose={vi.fn()} />);
    expect(await screen.findByText(/Duplicada de outra prova/)).toBeInTheDocument();
  });
});
