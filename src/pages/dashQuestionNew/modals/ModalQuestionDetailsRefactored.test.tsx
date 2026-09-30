import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModalQuestionDetailsRefactored } from "./ModalQuestionDetailsRefactored";

const getQuestionById = vi.hoisted(() => vi.fn());
const montagens = vi.hoisted(() => ({ n: 0 }));

vi.mock("@/services/question/getQuestionById", () => ({ getQuestionById }));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok", permissao: {} } }),
}));
vi.mock("react-toastify", () => ({
  toast: {
    loading: vi.fn(),
    update: vi.fn(),
    dismiss: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));
// As abas não interessam — só a Classificação, que "salva" e conta montagens.
vi.mock("./tabs/TabClassificacao", () => ({
  TabClassificacao: ({
    question,
    onSaveSuccess,
    onSujoChange,
  }: {
    question: { enunciado: string };
    onSaveSuccess: () => void;
    onSujoChange?: (sujo: boolean) => void;
  }) => {
    useEffect(() => {
      montagens.n += 1;
    }, []);
    return (
      <div>
        <span data-enunciado>{question.enunciado}</span>
        <button onClick={onSaveSuccess}>salvar</button>
        <button onClick={() => onSujoChange?.(true)}>sujar</button>
      </div>
    );
  },
}));
vi.mock("./tabs/TabConteudo", () => ({ TabConteudo: () => null }));
vi.mock("./tabs/TabAlternativas", () => ({ TabAlternativas: () => null }));
vi.mock("./tabs/TabHistorico", () => ({ TabHistorico: () => null }));
vi.mock("./tabs/TabImagens", () => ({ TabImagens: () => null }));
vi.mock("../components/AcoesDaQuestao", () => ({ AcoesDaQuestao: () => null }));
vi.mock("../components/AbaLinhagem", () => ({ AbaLinhagem: () => null }));

const questao = (enunciado: string) => ({ _id: "q1", enunciado });

describe("ModalQuestionDetailsRefactored — depois de salvar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    montagens.n = 0;
  });

  it("⚠️ não remonta o modal (não 'fecha') e mostra a questão atualizada", async () => {
    getQuestionById
      .mockResolvedValueOnce(questao("antes"))
      .mockResolvedValueOnce(questao("depois"));
    render(
      <ModalQuestionDetailsRefactored
        isOpen
        onClose={vi.fn()}
        questionId="q1"
        infos={{}}
      />,
    );
    expect(await screen.findByText("antes")).toBeTruthy();
    expect(montagens.n).toBe(1);

    await act(async () => {
      fireEvent.click(screen.getByText("salvar"));
    });

    await waitFor(() => expect(screen.getByText("depois")).toBeTruthy());
    expect(getQuestionById).toHaveBeenCalledTimes(2);
    expect(screen.queryByText("Carregando...")).toBeNull();
    expect(montagens.n).toBe(1);
  });

  it("se recarregar falha, a questão continua na tela", async () => {
    getQuestionById
      .mockResolvedValueOnce(questao("antes"))
      .mockRejectedValueOnce(new Error("falhou"));
    render(
      <ModalQuestionDetailsRefactored
        isOpen
        onClose={vi.fn()}
        questionId="q1"
        infos={{}}
      />,
    );
    await screen.findByText("antes");

    await act(async () => {
      fireEvent.click(screen.getByText("salvar"));
    });

    expect(screen.getByText("antes")).toBeTruthy();
    expect(screen.queryByText("Erro ao carregar questão")).toBeNull();
  });
});

describe("ModalQuestionDetailsRefactored — anterior/próxima", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getQuestionById.mockResolvedValue(questao("q"));
  });

  const abrir = (lista: Record<string, unknown>) =>
    render(
      <ModalQuestionDetailsRefactored
        isOpen
        onClose={vi.fn()}
        questionId="q1"
        infos={{}}
        lista={lista}
      />,
    );

  it("mostra a posição e chama a próxima e a anterior", async () => {
    const anterior = vi.fn();
    const proxima = vi.fn();
    abrir({ anterior, proxima, posicao: 6, total: 100 });

    expect(await screen.findByText("6 de 100")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Próxima questão" }));
    fireEvent.click(screen.getByRole("button", { name: "Questão anterior" }));
    expect(proxima).toHaveBeenCalledTimes(1);
    expect(anterior).toHaveBeenCalledTimes(1);
  });

  it("nas pontas, o botão fica desabilitado", async () => {
    abrir({ proxima: vi.fn(), posicao: 1, total: 100 });
    expect(
      await screen.findByRole("button", { name: "Questão anterior" }),
    ).toHaveProperty("disabled", true);
    expect(
      screen.getByRole("button", { name: "Próxima questão" }),
    ).toHaveProperty("disabled", false);
  });

  it("sem lista (quem monta não sabe navegar): sem os botões", async () => {
    render(
      <ModalQuestionDetailsRefactored isOpen onClose={vi.fn()} questionId="q1" infos={{}} />,
    );
    await screen.findByText("q");
    expect(screen.queryByRole("button", { name: "Próxima questão" })).toBeNull();
  });
});

describe("ModalQuestionDetailsRefactored — edição não salva da Classificação", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    montagens.n = 0;
    getQuestionById.mockResolvedValue(questao("q"));
  });

  const montar = () => {
    const onClose = vi.fn();
    render(
      <ModalQuestionDetailsRefactored
        isOpen
        onClose={onClose}
        questionId="q1"
        infos={{}}
      />,
    );
    return onClose;
  };

  it("sem edição, o X fecha direto", async () => {
    const onClose = montar();
    await screen.findByText("q");
    fireEvent.click(screen.getAllByRole("button", { name: "Fechar" })[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it("⚠️ com edição, o X pergunta antes — cancelar mantém, confirmar fecha", async () => {
    const onClose = montar();
    await screen.findByText("q");
    fireEvent.click(screen.getByText("sujar"));

    fireEvent.click(screen.getAllByRole("button", { name: "Fechar" })[0]);
    expect(screen.getByText("Descartar as alterações?")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getAllByRole("button", { name: "Fechar" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("⚠️ trocar de aba não desmonta a Classificação (a edição não se perde)", async () => {
    montar();
    await screen.findByText("q");
    expect(montagens.n).toBe(1);

    fireEvent.mouseDown(screen.getByRole("tab", { name: "Imagens" }));
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Classificação" }));

    expect(montagens.n).toBe(1);
  });
});
