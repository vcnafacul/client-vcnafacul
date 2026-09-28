import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ permissao: {} as Record<string, boolean> }));
const svc = vi.hoisted(() => ({
  updateStatus: vi.fn(),
  removeQuestionFromProva: vi.fn(),
  sinalizarRevisao: vi.fn(),
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
    update: vi.fn(),
    dismiss: vi.fn(),
  },
}));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok", permissao: auth.permissao } }),
}));
vi.mock("@/services/prova/getMissingNumber", () => ({
  getMissingNumber: vi.fn().mockResolvedValue([]),
}));
vi.mock("@/services/question/updateStatus", async (orig) => ({
  ...(await orig<typeof import("@/services/question/updateStatus")>()),
  updateStatus: svc.updateStatus,
}));
vi.mock("@/services/question/removeQuestionFromProva", () => ({
  removeQuestionFromProva: svc.removeQuestionFromProva,
}));
vi.mock("@/services/question/sinalizarRevisao", () => ({
  sinalizarRevisao: svc.sinalizarRevisao,
}));
vi.mock("react-toastify", () => ({ toast: svc.toast }));

import { ErroDoStatus } from "@/services/question/updateStatus";
import { TabClassificacao } from ".";

/** tickets/024, card 05. */
const PA = {
  provaId: "pa",
  provaNome: "Simulado do A",
  numero: 1,
  cursinhoId: "A",
  podeComporProva: true,
};
const PB = {
  provaId: "pb",
  provaNome: "Simulado do B",
  numero: 2,
  cursinhoId: "B",
  cursinhoNome: "Cursinho da Vila",
  podeComporProva: false,
};
const OF = {
  provaId: "of",
  provaNome: "ENEM 2023",
  numero: 3,
  cursinhoId: null,
  podeComporProva: false,
};

const questao = (status = 0) =>
  ({
    _id: "q1",
    enemArea: "Matemática",
    materia: "m1",
    frente1: "f1",
    status,
    provasContendo: [PA, PB, OF],
    provaBase: "pa",
  }) as never;
const infos = { provas: [], enemAreas: [], materias: [], frentes: [] } as never;
const montar = (status = 0, onSaveSuccess = vi.fn()) => {
  render(
    <TabClassificacao
      question={questao(status)}
      infos={infos}
      canEdit={false}
      onSaveSuccess={onSaveSuccess}
    />,
  );
  return { onSaveSuccess };
};
const recusar = () => {
  vi.spyOn(window, "confirm").mockReturnValue(true);
  fireEvent.click(screen.getByRole("button", { name: "Rejeitar" }));
  fireEvent.click(screen.getByRole("button", { name: "Confirmar Rejeição" }));
};
const bloqueio = () =>
  svc.updateStatus.mockRejectedValue(
    new ErroDoStatus("Esta questão é usada em provas de outros", 403, [
      { provaId: "pa", provaNome: "Simulado do A", cursinhoId: "A" },
      { provaId: "pb", provaNome: "Simulado do B", cursinhoId: "B" },
      { provaId: "of", provaNome: "ENEM 2023", cursinhoId: null },
    ]),
  );

describe("TabClassificacao — validador do cursinho (024 · 05)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.permissao = { validarQuestoesCursinho: true };
  });
  afterEach(() => {
    auth.permissao = {};
  });

  it("⚠️ quem só valida (sem editar) vê o status e os botões", () => {
    montar();
    expect(screen.getByRole("button", { name: "Aprovar" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Rejeitar" }),
    ).toBeInTheDocument();
  });

  it("quem não valida não vê os botões", () => {
    auth.permissao = { editarQuestoesCursinho: true };
    render(<TabClassificacao question={questao()} infos={infos} canEdit />);
    expect(screen.queryByRole("button", { name: "Aprovar" })).toBeNull();
  });

  it("⚠️ recusada: o validador do cursinho não reverte (sem Aprovar); a plataforma sim", () => {
    montar(2);
    expect(screen.queryByRole("button", { name: "Aprovar" })).toBeNull();
  });

  it("a plataforma vê Aprovar numa recusada", () => {
    auth.permissao = { validarQuestao: true };
    montar(2);
    expect(screen.getByRole("button", { name: "Aprovar" })).toBeInTheDocument();
  });

  it("⚠️ recusa barrada: o modal lista as provas — sua, de outro cursinho, oficial", async () => {
    bloqueio();
    montar();
    recusar();
    const modal = await screen.findByRole("dialog", {
      name: "Esta questão é usada em outras provas",
    });
    const lista = within(modal).getByRole("list");
    expect(lista).toHaveTextContent("Simulado do A — sua");
    expect(lista).toHaveTextContent("Simulado do B — Cursinho da Vila");
    expect(lista).toHaveTextContent("ENEM 2023 — oficial");
  });

  it("sem editar: 'Tirar das minhas provas' desabilitado, com o porquê", async () => {
    bloqueio();
    montar();
    recusar();
    const botao = await screen.findByRole("button", {
      name: "Tirar das minhas provas",
    });
    expect(botao).toBeDisabled();
    expect(botao.parentElement).toHaveAttribute(
      "title",
      expect.stringContaining("permissão de editar"),
    );
  });

  it("⚠️ com editar: tira só das provas DELE e recarrega", async () => {
    auth.permissao = {
      validarQuestoesCursinho: true,
      editarQuestoesCursinho: true,
    };
    svc.removeQuestionFromProva.mockResolvedValue(undefined);
    bloqueio();
    const { onSaveSuccess } = montar();
    recusar();
    fireEvent.click(
      await screen.findByRole("button", { name: "Tirar das minhas provas" }),
    );
    await waitFor(() => expect(onSaveSuccess).toHaveBeenCalled());
    expect(svc.removeQuestionFromProva).toHaveBeenCalledTimes(1);
    expect(svc.removeQuestionFromProva).toHaveBeenCalledWith("q1", "pa", "tok");
  });

  it("sinalizar: motivo curto não envia; motivo ok envia", async () => {
    svc.sinalizarRevisao.mockResolvedValue(undefined);
    bloqueio();
    montar();
    recusar();
    fireEvent.click(
      await screen.findByRole("button", { name: "Sinalizar para revisão" }),
    );
    const enviar = screen.getByRole("button", { name: "Enviar para revisão" });
    fireEvent.change(screen.getByLabelText("Motivo da revisão"), {
      target: { value: "curto" },
    });
    expect(enviar).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Motivo da revisão"), {
      target: { value: "O gabarito está errado, a correta é a C." },
    });
    fireEvent.click(enviar);
    await waitFor(() =>
      expect(svc.sinalizarRevisao).toHaveBeenCalledWith(
        "q1",
        "O gabarito está errado, a correta é a C.",
        "tok",
      ),
    );
  });

  it("recusa permitida (sem bloqueio): segue normal, sem modal", async () => {
    svc.updateStatus.mockResolvedValue(true);
    montar();
    recusar();
    await waitFor(() => expect(svc.updateStatus).toHaveBeenCalled());
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
