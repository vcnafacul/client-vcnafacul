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
  }: {
    question: { enunciado: string };
    onSaveSuccess: () => void;
  }) => {
    useEffect(() => {
      montagens.n += 1;
    }, []);
    return (
      <div>
        <span data-enunciado>{question.enunciado}</span>
        <button onClick={onSaveSuccess}>salvar</button>
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
