import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const svc = vi.hoisted(() => ({
  getProvaById: vi.fn(),
  buscarSimuladosComCartao: vi.fn(),
}));
vi.mock("../../../services/prova/getProvaById", () => ({
  getProvaById: svc.getProvaById,
}));
vi.mock("@/services/relatorioSimulado/buscarSimuladosComCartao", () => ({
  buscarSimuladosComCartao: svc.buscarSimuladosComCartao,
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
  _id: "p1",
  nome: "Prova do cursinho",
  totalQuestao: 90,
  totalQuestaoCadastradas: 90,
  totalQuestaoValidadas: 90,
} as never;

const ROTULO = "Relatório da prova";

/** tickets/034, card 04 — o botão "Relatório da prova". */
describe("ShowProva — relatório da prova (034)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    svc.getProvaById.mockResolvedValue({ simulados: [{ _id: "s1" }] });
  });

  it("⚠️ sem a prop (dashProvas, admin): não há botão, nem busca de cartões", async () => {
    render(<ShowProva prova={PROVA} isOpen handleClose={vi.fn()} />);
    await waitFor(() => expect(svc.getProvaById).toHaveBeenCalled());

    expect(screen.queryByRole("button", { name: ROTULO })).toBeNull();
    expect(svc.buscarSimuladosComCartao).not.toHaveBeenCalled();
  });

  it("com cartão num simulado da prova: habilitado, e abre o relatório", async () => {
    svc.buscarSimuladosComCartao.mockResolvedValue({
      simulados: [{ simuladoId: "s1", cartoes: 3 }],
    });
    const aoAbrir = vi.fn();
    render(
      <ShowProva
        prova={PROVA}
        isOpen
        handleClose={vi.fn()}
        relatorioDaProva={{ permitido: true, aoAbrir }}
      />,
    );

    const botao = screen.getByRole("button", { name: ROTULO });
    await waitFor(() => expect(botao).toBeEnabled());
    fireEvent.click(botao);
    expect(aoAbrir).toHaveBeenCalled();
  });

  it("⚠️ cartão só em simulado de OUTRA prova: desabilitado, com o motivo", async () => {
    svc.buscarSimuladosComCartao.mockResolvedValue({
      simulados: [{ simuladoId: "outro", cartoes: 5 }],
    });
    render(
      <ShowProva
        prova={PROVA}
        isOpen
        handleClose={vi.fn()}
        relatorioDaProva={{ permitido: true, aoAbrir: vi.fn() }}
      />,
    );

    await waitFor(() => expect(svc.buscarSimuladosComCartao).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: ROTULO })).toBeDisabled();
    expect(
      screen.getByTitle(/Nenhum cartão-resposta enviado/),
    ).toBeInTheDocument();
  });

  it("sem permissão: desabilitado com o motivo, sem chamar a rota", async () => {
    render(
      <ShowProva
        prova={PROVA}
        isOpen
        handleClose={vi.fn()}
        relatorioDaProva={{ permitido: false, aoAbrir: vi.fn() }}
      />,
    );
    await waitFor(() => expect(svc.getProvaById).toHaveBeenCalled());

    expect(screen.getByRole("button", { name: ROTULO })).toBeDisabled();
    expect(screen.getByTitle(/não tem permissão/)).toBeInTheDocument();
    expect(svc.buscarSimuladosComCartao).not.toHaveBeenCalled();
  });
});
