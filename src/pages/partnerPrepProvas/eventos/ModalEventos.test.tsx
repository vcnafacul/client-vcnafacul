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
import { textoDaExclusao } from "./textoDaExclusao";
import { PROVAS_MAX, TEXTO_MAXIMO_DE_PROVAS } from "./FormDoEvento";

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

/** Prova da lista; completa = todas as questões validadas. */
const prova = (_id: string, nome: string, completa = true, ano = 2026) => ({
  _id,
  nome,
  ano,
  totalQuestao: 90,
  totalQuestaoCadastradas: 90,
  totalQuestaoValidadas: completa ? 90 : 40,
});

const abrir = (podeEditar = true) =>
  render(<ModalEventos isOpen handleClose={vi.fn()} token="tk" podeEditar={podeEditar} />);

describe("Eventos de simulado na tela de provas (026 · 06)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    svc.listarEventos.mockResolvedValue([evento()]);
    provasSvc.getProvasCursinho.mockResolvedValue({
      data: [prova("p-en", "Simulado Inglês"), prova("p-es", "Simulado Espanhol")],
      totalItems: 2,
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
    fireEvent.click(await screen.findByRole("button", { name: /Simulado Inglês/ }));
    fireEvent.click(await screen.findByRole("button", { name: /Simulado Espanhol/ }));
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
    fireEvent.click(await screen.findByRole("button", { name: "Tirar Simulado Espanhol" }));
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
        { provaId: "p-en", nome: "Simulado Inglês", inscritos: 2, fizeram: 1, trocaram: 0, naoVieram: 1 },
        { provaId: "p-es", nome: "Simulado Espanhol", inscritos: 1, fizeram: 1, trocaram: 0, naoVieram: 0 },
      ],
      totalInscritos: 3,
      inscritosQueFizeram: 2,
      engajamento: 2 / 3,
      inscritos: [
        { nome: "Ana", provaId: "p-en", fez: true, provaQueFez: "p-en" },
        { nome: "Beto", provaId: "p-en", fez: false, provaQueFez: null },
        { nome: "Caio", provaId: "p-es", fez: true, provaQueFez: "p-es" },
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

  describe("escolha das provas (busca)", () => {
    const abrirNovo = async () => {
      abrir();
      fireEvent.click(await screen.findByRole("button", { name: "Novo evento" }));
      return screen.findByRole("list", { name: "Resultados da busca" });
    };

    it("só provas completas, com o ano", async () => {
      provasSvc.getProvasCursinho.mockResolvedValue({
        data: [
          prova("p1", "Simulado Inglês", true, 2025),
          prova("p2", "Simulado em cadastro", false),
        ],
        totalItems: 2,
      });
      const lista = await abrirNovo();
      expect(within(lista).getByRole("button", { name: /Simulado Inglês/ })).toHaveTextContent(
        "2025",
      );
      expect(within(lista).queryByText("Simulado em cadastro")).toBeNull();
    });

    it("busca pelo nome, sem acento e sem diferenciar maiúsculas; escolhida sai da lista", async () => {
      provasSvc.getProvasCursinho.mockResolvedValue({
        data: [
          prova("p1", "Simulado Inglês"),
          prova("p2", "Simulado Espanhol"),
          prova("p3", "Revisão de Matemática"),
        ],
        totalItems: 3,
      });
      await abrirNovo();
      fireEvent.change(screen.getByLabelText("Buscar prova"), { target: { value: "INGLES" } });
      let lista = screen.getByRole("list", { name: "Resultados da busca" });
      expect(within(lista).getAllByRole("button")).toHaveLength(1);

      fireEvent.click(within(lista).getByRole("button", { name: /Simulado Inglês/ }));
      expect(
        within(screen.getByRole("list", { name: "Provas escolhidas" })).getByText(/Simulado Inglês/),
      ).toBeInTheDocument();
      // a busca limpa e a escolhida não aparece mais nos resultados
      expect(screen.getByLabelText("Buscar prova")).toHaveValue("");
      lista = screen.getByRole("list", { name: "Resultados da busca" });
      expect(within(lista).queryByText("Simulado Inglês")).toBeNull();
      expect(within(lista).getAllByRole("button")).toHaveLength(2);
    });

    it("sem resultado: avisa", async () => {
      await abrirNovo();
      fireEvent.change(screen.getByLabelText("Buscar prova"), { target: { value: "xyz" } });
      expect(screen.getByText("Nenhuma prova completa com esse nome.")).toBeInTheDocument();
    });

    it("⚠️ busca TODAS as páginas de provas, não só a primeira", async () => {
      provasSvc.getProvasCursinho
        .mockResolvedValueOnce({
          data: Array.from({ length: 100 }, (_, i) => prova(`a${i}`, `Prova ${i}`)),
          totalItems: 101,
        })
        .mockResolvedValueOnce({ data: [prova("ultima", "A última prova")], totalItems: 101 });
      await abrirNovo();
      fireEvent.change(screen.getByLabelText("Buscar prova"), { target: { value: "última" } });
      expect(
        within(screen.getByRole("list", { name: "Resultados da busca" })).getByText(
          "A última prova",
        ),
      ).toBeInTheDocument();
      expect(provasSvc.getProvasCursinho).toHaveBeenCalledWith("tk", 2, 100);
    });

    it("muitas provas: mostra 20 e pede para refinar", async () => {
      provasSvc.getProvasCursinho.mockResolvedValue({
        data: Array.from({ length: 30 }, (_, i) => prova(`p${i}`, `Prova ${i}`)),
        totalItems: 30,
      });
      const lista = await abrirNovo();
      expect(within(lista).getAllByRole("button")).toHaveLength(20);
      expect(screen.getByText("Mostrando 20 de 30. Refine a busca.")).toBeInTheDocument();
    });
  });
});

describe("Eventos de simulado — card 38", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    svc.listarEventos.mockResolvedValue([evento()]);
  });

  it("⚠️ na 10ª prova a busca some e o limite aparece", async () => {
    provasSvc.getProvasCursinho.mockResolvedValue({
      data: Array.from({ length: 12 }, (_, i) => prova(`p${i}`, `Prova ${i}`)),
      totalItems: 12,
    });
    abrir();
    fireEvent.click(await screen.findByRole("button", { name: "Novo evento" }));
    await screen.findByRole("list", { name: "Resultados da busca" });

    for (let i = 0; i < PROVAS_MAX; i++) {
      const lista = screen.getByRole("list", { name: "Resultados da busca" });
      fireEvent.click(within(lista).getByRole("button", { name: new RegExp(`^Prova ${i}\\b`) }));
    }

    expect(
      within(screen.getByRole("list", { name: "Provas escolhidas" })).getAllByRole("listitem"),
    ).toHaveLength(PROVAS_MAX);
    expect(screen.getByRole("status")).toHaveTextContent(TEXTO_MAXIMO_DE_PROVAS);
    expect(screen.queryByLabelText("Buscar prova")).toBeNull();

    // tirar uma devolve a busca
    fireEvent.click(screen.getByRole("button", { name: "Tirar Prova 0" }));
    expect(screen.getByLabelText("Buscar prova")).toBeInTheDocument();
  });

  it("excluir com inscritos: a confirmação diz quantos e que serão avisados", () => {
    expect(textoDaExclusao(evento() as never)).toBe(
      'Excluir o evento "Simulado de outubro"? Há 20 alunos inscritos. Eles serão avisados de que o simulado foi cancelado.',
    );
    expect(textoDaExclusao(evento({ totalInscritos: 1 }) as never)).toContain(
      "Há 1 aluno inscrito. Ele será avisado",
    );
  });

  it("⚠️ sem inscritos ou já encerrado: só a pergunta, sem prometer aviso", () => {
    expect(textoDaExclusao(evento({ totalInscritos: 0 }) as never)).toBe(
      'Excluir o evento "Simulado de outubro"?',
    );
    expect(textoDaExclusao(evento({ status: "encerrado" }) as never)).toBe(
      'Excluir o evento "Simulado de outubro"?',
    );
  });

  it("painel: quem trocou de prova aparece destacado; filtro vazio diz 'nesta prova'", async () => {
    provasSvc.getProvasCursinho.mockResolvedValue({ data: [], totalItems: 0 });
    svc.listarEventos.mockResolvedValue([
      evento({
        provas: [
          { provaId: "p-en", nome: "Simulado Inglês", inscritos: 1 },
          { provaId: "p-es", nome: "Simulado Espanhol", inscritos: 0 },
          { provaId: "p-ma", nome: "Simulado Matemática", inscritos: 0 },
        ],
      }),
    ]);
    svc.engajamentoDoEvento.mockResolvedValue({
      porProva: [
        { provaId: "p-en", nome: "Simulado Inglês", inscritos: 1, fizeram: 0, trocaram: 1, naoVieram: 0 },
        { provaId: "p-es", nome: "Simulado Espanhol", inscritos: 0, fizeram: 1, trocaram: 0, naoVieram: 0 },
        { provaId: "p-ma", nome: "Simulado Matemática", inscritos: 0, fizeram: 0, trocaram: 0, naoVieram: 0 },
      ],
      totalInscritos: 1,
      inscritosQueFizeram: 1,
      engajamento: 1,
      inscritos: [{ nome: "Pedro", provaId: "p-en", fez: true, provaQueFez: "p-es" }],
      fizeramSemInscricao: [],
    });
    abrir();
    fireEvent.click(await screen.findByRole("button", { name: "Ver inscritos e engajamento" }));

    expect(await screen.findByText("fez outra prova (Simulado Espanhol)")).toBeInTheDocument();
    expect(screen.getByText("Trocaram de prova")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Filtrar por prova"), { target: { value: "p-ma" } });
    expect(screen.getByText("Ninguém inscrito nesta prova.")).toBeInTheDocument();
  });
});

