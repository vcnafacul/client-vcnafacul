import { render, screen, waitFor } from "@testing-library/react";
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
};

describe("ShowProva — download só com PDF (card 37)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    svc.getProvaById.mockResolvedValue({});
  });

  it("com PDF: mostra o botão de download", async () => {
    render(
      <ShowProva prova={{ ...PROVA, filename: "a.pdf" } as never} isOpen handleClose={vi.fn()} />,
    );
    await waitFor(() => expect(svc.getProvaById).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: /Download da Prova/ })).toBeInTheDocument();
    expect(screen.queryByText(/Sem PDF da prova/)).toBeNull();
  });

  it("⚠️ sem PDF: nada de botão que falha — aponta o Editar arquivos", async () => {
    render(<ShowProva prova={PROVA as never} isOpen handleClose={vi.fn()} />);
    await waitFor(() => expect(svc.getProvaById).toHaveBeenCalled());
    expect(screen.queryByRole("button", { name: /Download da Prova/ })).toBeNull();
    expect(
      screen.getByText("Sem PDF da prova — adicione em Editar arquivos"),
    ).toBeInTheDocument();
  });

  it("sem PDF e sem poder editar arquivos: não manda para um botão desabilitado", async () => {
    render(
      <ShowProva
        prova={PROVA as never}
        isOpen
        handleClose={vi.fn()}
        edicao={{ permitido: false, motivo: "Requer permissão" }}
      />,
    );
    await waitFor(() => expect(svc.getProvaById).toHaveBeenCalled());
    expect(screen.getByText("Sem PDF da prova")).toBeInTheDocument();
  });
});
