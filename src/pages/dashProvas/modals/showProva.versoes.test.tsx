import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const svc = vi.hoisted(() => ({
  getProvaById: vi.fn(),
  alterarReceberNovasVersoes: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn(), loading: vi.fn(), update: vi.fn() },
}));
vi.mock("../../../services/prova/getProvaById", () => ({
  getProvaById: svc.getProvaById,
}));
vi.mock("../../../services/prova/alterarReceberNovasVersoes", () => ({
  alterarReceberNovasVersoes: svc.alterarReceberNovasVersoes,
}));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));
vi.mock("react-toastify", () => ({ toast: svc.toast }));
vi.mock("@/components/templates/modalTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("./simuladosView", () => ({ default: () => null }));

import ShowProva from "./showProva";

const PROVA = {
  _id: "p1",
  nome: "Simulado do A",
  totalQuestao: 10,
  totalQuestaoCadastradas: 5,
  totalQuestaoValidadas: 2,
} as never;

const abrir = () =>
  render(<ShowProva prova={PROVA} isOpen handleClose={vi.fn()} />);
const opcao = () =>
  screen.findByRole("checkbox", { name: /Aplicar novas versões/ });

describe("ShowProva — novas versões (023 · 09)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    svc.alterarReceberNovasVersoes.mockResolvedValue({ receberNovasVersoes: true });
  });

  it("o dono vê o controle; ao MARCAR confirma e salva", async () => {
    svc.getProvaById.mockResolvedValue({ podeComporProva: true, receberNovasVersoes: false });
    const confirmar = vi.spyOn(window, "confirm").mockReturnValue(true);
    abrir();

    fireEvent.click(await opcao());

    expect(confirmar).toHaveBeenCalledWith(
      expect.stringContaining("As que já existem não são aplicadas agora."),
    );
    await waitFor(() =>
      expect(svc.alterarReceberNovasVersoes).toHaveBeenCalledWith("p1", true, "tok"),
    );
    await waitFor(async () => expect(await opcao()).toBeChecked());
  });

  it("cancelar a confirmação não muda nada", async () => {
    svc.getProvaById.mockResolvedValue({ podeComporProva: true, receberNovasVersoes: false });
    vi.spyOn(window, "confirm").mockReturnValue(false);
    abrir();
    fireEvent.click(await opcao());
    expect(svc.alterarReceberNovasVersoes).not.toHaveBeenCalled();
  });

  it("desmarcar não pede confirmação", async () => {
    svc.getProvaById.mockResolvedValue({ podeComporProva: true, receberNovasVersoes: true });
    const confirmar = vi.spyOn(window, "confirm");
    abrir();
    fireEvent.click(await opcao());
    await waitFor(() =>
      expect(svc.alterarReceberNovasVersoes).toHaveBeenCalledWith("p1", false, "tok"),
    );
    expect(confirmar).not.toHaveBeenCalled();
  });

  it("⚠️ quem não é dono só vê o indicador, sem controle", async () => {
    svc.getProvaById.mockResolvedValue({ podeComporProva: false, receberNovasVersoes: true });
    abrir();
    expect(await screen.findByTestId("indicador-versoes")).toHaveTextContent(
      "🔄 Recebe novas versões",
    );
    expect(screen.queryByRole("checkbox", { name: /Aplicar novas versões/ })).toBeNull();
  });

  it("403 do ms vira toast com a mensagem", async () => {
    svc.getProvaById.mockResolvedValue({ podeComporProva: true, receberNovasVersoes: true });
    svc.alterarReceberNovasVersoes.mockRejectedValue(
      new Error("Esta prova pertence a outro cursinho."),
    );
    abrir();
    fireEvent.click(await opcao());
    await waitFor(() =>
      expect(svc.toast.error).toHaveBeenCalledWith("Esta prova pertence a outro cursinho."),
    );
  });
});
