import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const svc = vi.hoisted(() => ({
  listarEventos: vi.fn(),
  salvarEvento: vi.fn(),
  excluirEvento: vi.fn(),
  engajamentoDoEvento: vi.fn(),
}));
vi.mock("@/services/eventoSimulado", () => svc);
const provasSvc = vi.hoisted(() => ({ getProvasCursinho: vi.fn() }));
vi.mock("@/services/prova/getProvasCursinho", () => provasSvc);
const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
vi.mock("react-toastify", () => ({ toast }));
vi.mock("@/components/templates/modalTemplate", () => ({
  default: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <div role="dialog">{children}</div> : null,
}));

import { ModalEventos } from "./ModalEventos";

const evento = (over = {}) => ({
  id: "e1",
  nome: "Simulado de outubro",
  descricao: "Sábado, 8h",
  inscricoesDe: "2026-10-01T11:00:00.000Z",
  inscricoesAte: "2026-10-10T11:00:00.000Z",
  status: "aberto",
  provas: [
    { provaId: "p-en", nome: "Simulado Inglês", inscritos: 12 },
    { provaId: "p-es", nome: "Simulado Espanhol", inscritos: 8 },
  ],
  totalInscritos: 20,
  ...over,
});

const abrir = (podeEditar = true) =>
  render(<ModalEventos isOpen handleClose={vi.fn()} token="tk" podeEditar={podeEditar} />);

describe("Eventos de simulado na tela de provas (026 · 06)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    svc.listarEventos.mockResolvedValue([evento()]);
    provasSvc.getProvasCursinho.mockResolvedValue({
      data: [
        { _id: "p-en", nome: "Simulado Inglês" },
        { _id: "p-es", nome: "Simulado Espanhol" },
      ],
    });
  });

  it("lista com status e inscritos por prova (quanto imprimir)", async () => {
    abrir();
    expect(await screen.findByText("Simulado de outubro")).toBeInTheDocument();
    expect(screen.getByText("Inscrições abertas")).toBeInTheDocument();
    expect(screen.getByText(/Simulado Inglês: 12 · Simulado Espanhol: 8/)).toBeInTheDocument();
  });

  it("só ver provas: sem Novo, Editar e Excluir", async () => {
    abrir(false);
    await screen.findByText("Simulado de outubro");
    expect(screen.queryByRole("button", { name: "Novo evento" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Editar" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Excluir" })).toBeNull();
    expect(provasSvc.getProvasCursinho).not.toHaveBeenCalled();
  });

  it("cria com as provas escolhidas e a janela em ISO; recarrega a lista", async () => {
    svc.salvarEvento.mockResolvedValue(evento());
    abrir();
    fireEvent.click(await screen.findByRole("button", { name: "Novo evento" }));
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Simulado de novembro" } });
    fireEvent.change(screen.getByLabelText("Início das inscrições"), {
      target: { value: "2026-11-01T08:00" },
    });
    fireEvent.change(screen.getByLabelText("Fim das inscrições"), {
      target: { value: "2026-11-10T18:00" },
    });
    fireEvent.click(await screen.findByLabelText("Simulado Inglês"));
    fireEvent.click(screen.getByLabelText("Simulado Espanhol"));
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => expect(svc.salvarEvento).toHaveBeenCalled());
    const [token, corpo, id] = svc.salvarEvento.mock.calls[0];
    expect(token).toBe("tk");
    expect(id).toBeUndefined();
    expect(corpo).toEqual({
      nome: "Simulado de novembro",
      descricao: null,
      inscricoesDe: new Date("2026-11-01T08:00").toISOString(),
      inscricoesAte: new Date("2026-11-10T18:00").toISOString(),
      provaIds: ["p-en", "p-es"],
    });
    await waitFor(() => expect(svc.listarEventos).toHaveBeenCalledTimes(2));
  });

  it("janela invertida: avisa e o Salvar fica bloqueado", async () => {
    abrir();
    fireEvent.click(await screen.findByRole("button", { name: "Novo evento" }));
    fireEvent.change(screen.getByLabelText("Início das inscrições"), {
      target: { value: "2026-11-10T08:00" },
    });
    fireEvent.change(screen.getByLabelText("Fim das inscrições"), {
      target: { value: "2026-11-01T08:00" },
    });
    expect(screen.getByRole("alert")).toHaveTextContent("depois do início");
    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
  });

  it("409 ao tirar prova com inscritos vira toast e o formulário fica", async () => {
    svc.salvarEvento.mockRejectedValue(
      new Error("Há alunos inscritos nesta prova. (Simulado Espanhol)"),
    );
    abrir();
    fireEvent.click(await screen.findByRole("button", { name: "Editar" }));
    fireEvent.click(await screen.findByLabelText("Simulado Espanhol")); // desmarca
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Há alunos inscritos nesta prova. (Simulado Espanhol)",
      ),
    );
    expect(svc.salvarEvento.mock.calls[0][2]).toBe("e1");
    expect(screen.getByText("Editar evento")).toBeInTheDocument();
  });

  it("painel: números por prova, engajamento e lista filtrável", async () => {
    svc.engajamentoDoEvento.mockResolvedValue({
      porProva: [
        { provaId: "p-en", nome: "Simulado Inglês", inscritos: 2, fizeram: 1, naoVieram: 1 },
        { provaId: "p-es", nome: "Simulado Espanhol", inscritos: 1, fizeram: 1, naoVieram: 0 },
      ],
      totalInscritos: 3,
      inscritosQueFizeram: 2,
      engajamento: 2 / 3,
      inscritos: [
        { nome: "Ana", provaId: "p-en", fez: true },
        { nome: "Beto", provaId: "p-en", fez: false },
        { nome: "Caio", provaId: "p-es", fez: true },
      ],
      fizeramSemInscricao: [{ nome: "Dani", provaId: "p-en" }],
    });
    abrir();
    fireEvent.click(await screen.findByRole("button", { name: "Ver inscritos e engajamento" }));

    expect(await screen.findByText("67%")).toBeInTheDocument();
    const tabela = screen.getByRole("table", { name: "Números por prova" });
    expect(within(tabela).getAllByRole("row")).toHaveLength(3);
    expect(screen.getByText("Dani")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Filtrar por prova"), { target: { value: "p-es" } });
    const lista = screen.getByRole("list", { name: "Lista de inscritos" });
    expect(within(lista).getAllByRole("listitem")).toHaveLength(1);
    expect(within(lista).getByText("Caio")).toBeInTheDocument();
  });

  it("excluir pede confirmação", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    svc.excluirEvento.mockResolvedValue(undefined);
    abrir();
    fireEvent.click(await screen.findByRole("button", { name: "Excluir" }));
    await waitFor(() => expect(svc.excluirEvento).toHaveBeenCalledWith("tk", "e1"));
  });
});
