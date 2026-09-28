import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const svc = vi.hoisted(() => ({
  listarAtualizacoes: vi.fn(),
  aplicarAtualizacoes: vi.fn(),
  getQuestionById: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("@/services/prova/atualizacoes", () => ({
  listarAtualizacoes: svc.listarAtualizacoes,
  aplicarAtualizacoes: svc.aplicarAtualizacoes,
}));
vi.mock("@/services/question/getQuestionById", () => ({
  getQuestionById: svc.getQuestionById,
}));
vi.mock("react-toastify", () => ({ toast: svc.toast }));

import {
  BuscarAtualizacoes,
  TEXTO_CADEIA_INTERROMPIDA,
  TEXTO_CONFIRMAR_APLICAR,
  TEXTO_EM_REVISAO,
  TEXTO_VAZIO,
} from "./BuscarAtualizacoes";

/** tickets/023, card 15. */
const Q12 = {
  numero: 12,
  atual: { _id: "q12", status: 1 },
  oferta: { _id: "q12b", status: 0, saltos: 2 },
  cadeiaInterrompida: false,
  camposAlterados: ["textoQuestao", "alternativa"],
};
const Q30 = {
  numero: 30,
  atual: { _id: "q30", status: 1 },
  oferta: { _id: "q30b", status: 1, saltos: 1 },
  cadeiaInterrompida: true,
  camposAlterados: [],
};

const abrir = async () => {
  render(<BuscarAtualizacoes provaId="p1" token="tok" />);
  fireEvent.click(screen.getByRole("button", { name: "Buscar atualizações" }));
  await waitFor(() => expect(svc.listarAtualizacoes).toHaveBeenCalled());
};

describe("BuscarAtualizacoes (023 · 15)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    svc.aplicarAtualizacoes.mockResolvedValue({ trocadas: 1, simulados: 1 });
  });

  it("⚠️ carrega sob demanda: nada antes do clique", () => {
    render(<BuscarAtualizacoes provaId="p1" token="tok" />);
    expect(svc.listarAtualizacoes).not.toHaveBeenCalled();
  });

  it("lista vazia: a prova está nas versões mais recentes", async () => {
    svc.listarAtualizacoes.mockResolvedValue({ podeComporProva: true, atualizacoes: [] });
    await abrir();
    expect(await screen.findByText(TEXTO_VAZIO)).toBeInTheDocument();
  });

  it("cada linha: questão, saltos, status, o que mudou, em revisão e cadeia interrompida", async () => {
    svc.listarAtualizacoes.mockResolvedValue({
      podeComporProva: true,
      atualizacoes: [Q12, Q30],
    });
    await abrir();
    expect(await screen.findByText("Questão 12")).toBeInTheDocument();
    expect(screen.getByText(/\+2 versões/)).toBeInTheDocument();
    expect(screen.getByText(/\+1 versão\)/)).toBeInTheDocument();
    expect(screen.getByText("Em revisão")).toBeInTheDocument();
    expect(screen.getByText("Mudou: enunciado, gabarito")).toBeInTheDocument();
    expect(screen.getByText(TEXTO_EM_REVISAO)).toBeInTheDocument();
    expect(screen.getByText(TEXTO_CADEIA_INTERROMPIDA)).toBeInTheDocument();
  });

  it("⚠️ o dono aplica só as selecionadas, confirma, e a lista recarrega", async () => {
    svc.listarAtualizacoes.mockResolvedValue({
      podeComporProva: true,
      atualizacoes: [Q12, Q30],
    });
    const confirmar = vi.spyOn(window, "confirm").mockReturnValue(true);
    await abrir();

    fireEvent.click(await screen.findByRole("checkbox", { name: "Aplicar em Questão 30" }));
    fireEvent.click(screen.getByRole("button", { name: "Aplicar selecionadas" }));

    expect(confirmar).toHaveBeenCalledWith(TEXTO_CONFIRMAR_APLICAR);
    await waitFor(() =>
      expect(svc.aplicarAtualizacoes).toHaveBeenCalledWith(
        "p1",
        [{ de: "q30", para: "q30b" }],
        "tok",
      ),
    );
    await waitFor(() => expect(svc.listarAtualizacoes).toHaveBeenCalledTimes(2));
  });

  it("sem nada selecionado, 'Aplicar' fica desabilitado", async () => {
    svc.listarAtualizacoes.mockResolvedValue({ podeComporProva: true, atualizacoes: [Q12] });
    await abrir();
    expect(
      await screen.findByRole("button", { name: "Aplicar selecionadas" }),
    ).toBeDisabled();
  });

  it("⚠️ quem não é dono vê a lista sem ações", async () => {
    svc.listarAtualizacoes.mockResolvedValue({ podeComporProva: false, atualizacoes: [Q12] });
    await abrir();
    expect(await screen.findByText("Questão 12")).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.queryByRole("button", { name: "Aplicar selecionadas" })).toBeNull();
  });

  it("403/400 viram toast com a mensagem", async () => {
    svc.listarAtualizacoes.mockResolvedValue({ podeComporProva: true, atualizacoes: [Q12] });
    svc.aplicarAtualizacoes.mockRejectedValue(new Error("Esta prova pertence a outro cursinho."));
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await abrir();
    fireEvent.click(await screen.findByRole("checkbox", { name: "Aplicar em Questão 12" }));
    fireEvent.click(screen.getByRole("button", { name: "Aplicar selecionadas" }));
    await waitFor(() =>
      expect(svc.toast.error).toHaveBeenCalledWith("Esta prova pertence a outro cursinho."),
    );
  });

  it("ver lado a lado busca as duas versões", async () => {
    svc.listarAtualizacoes.mockResolvedValue({ podeComporProva: false, atualizacoes: [Q12] });
    svc.getQuestionById.mockImplementation(async (_t: string, id: string) => ({
      _id: id,
      textoQuestao: id === "q12" ? "Texto antigo" : "Texto novo",
    }));
    await abrir();
    fireEvent.click(await screen.findByRole("button", { name: "Ver lado a lado" }));
    expect(await screen.findByText("Texto antigo")).toBeInTheDocument();
    expect(screen.getByText("Texto novo")).toBeInTheDocument();
  });
});
