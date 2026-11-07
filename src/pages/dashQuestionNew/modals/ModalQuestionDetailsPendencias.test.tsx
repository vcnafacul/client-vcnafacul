import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ModalQuestionDetailsRefactored } from "./ModalQuestionDetailsRefactored";
import type { Pendencia } from "./tabs/TabConteudo/pendencias";

const getQuestionById = vi.hoisted(() => vi.fn());
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
vi.mock("./tabs/TabClassificacao", () => ({
  TabClassificacao: () => <p>classificação</p>,
}));
// O Enunciado real puxa o TipTap; aqui basta o "Editar" e o "Ir" das pendências.
vi.mock("./tabs/TabConteudo", () => ({
  TabConteudo: ({
    onEdit,
    pendencias,
    onIrPara,
  }: {
    onEdit: () => void;
    pendencias: Pendencia[];
    onIrPara: (p: Pendencia) => void;
  }) => (
    <div>
      <button onClick={onEdit}>editar conteúdo</button>
      {pendencias.map((p) => (
        <button key={p.campo} onClick={() => onIrPara(p)}>
          ir para {p.rotulo}
        </button>
      ))}
    </div>
  ),
}));
vi.mock("./tabs/TabAlternativas", () => ({
  TabAlternativas: () => <p>alternativas</p>,
}));
vi.mock("./tabs/TabHistorico", () => ({ TabHistorico: () => null }));
vi.mock("./tabs/TabImagens", () => ({ TabImagens: () => null }));
vi.mock("../components/AcoesDaQuestao", () => ({ AcoesDaQuestao: () => null }));
vi.mock("../components/AbaLinhagem", () => ({ AbaLinhagem: () => null }));

const questaoAntiga = {
  _id: "q1",
  textoQuestao: "o enunciado original da questao",
  pergunta: "",
  textoAlternativaA: "",
  textoAlternativaB: "b",
  textoAlternativaC: "c",
  textoAlternativaD: "d",
  textoAlternativaE: "e",
  alternativa: "A",
};

const abrirEditando = async () => {
  getQuestionById.mockResolvedValue(questaoAntiga);
  render(
    <ModalQuestionDetailsRefactored
      isOpen
      onClose={vi.fn()}
      questionId="q1"
      infos={{}}
      abaInicial="conteudo"
    />,
  );
  const alvo = await screen.findByText("editar conteúdo");
    await act(async () => {
      fireEvent.click(alvo);
    });
};

const aba = (nome: string) => screen.getByRole("tab", { name: nome });

describe("pendências do conteúdo em todas as abas", () => {
  it("'Ir até o campo' troca para a aba do problema", async () => {
    await abrirEditando();
    const alvo = await screen.findByText("ir para Alternativa A");
    await act(async () => {
      fireEvent.click(alvo);
    });
    expect(aba("Alternativas")).toHaveAttribute("aria-selected", "true");
  });

  it("fora do Enunciado, a faixa do topo lista o problema e o Salvar fica travado", async () => {
    await abrirEditando();
    const alvo = await screen.findByText("ir para Alternativa A");
    await act(async () => {
      fireEvent.click(alvo);
    });
    expect(
      screen.getAllByText(/1 problema impede salvar/).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/A alternativa A é obrigatória/).length,
    ).toBeGreaterThan(0);
    for (const salvar of screen.getAllByRole("button", {
      name: /Salvar enunciado e alternativas/,
    })) {
      expect(salvar).toBeDisabled();
    }
  });

  it("no Enunciado, onde já está o Salvar, a faixa não aparece", async () => {
    await abrirEditando();
    expect(aba("Enunciado")).toHaveAttribute("aria-selected", "true");
    expect(
      screen.queryByRole("button", { name: /Salvar enunciado e alternativas/ }),
    ).toBeNull();
  });

  it("sem edição em curso, nenhuma faixa", async () => {
    getQuestionById.mockResolvedValue(questaoAntiga);
    render(
      <ModalQuestionDetailsRefactored
        isOpen
        onClose={vi.fn()}
        questionId="q1"
        infos={{}}
      />,
    );
    await screen.findAllByText("classificação");
    expect(screen.queryByText(/impede salvar/)).toBeNull();
  });
});
