import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  AnswerCollectionType,
  AnswerType,
  QuestionForm,
} from "@/types/partnerPrepForm/questionForm";
import { Logic, Operator } from "@/types/partnerPrepForm/condition";

vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));
vi.mock("react-toastify", () => ({
  /*
    ⚠️ `update` e `dismiss` também: o `useToastAsync` fecha o toast de
    carregamento com `update` no SUCESSO. Sem eles, o sucesso lançava, o
    `catch` chamava `update` de novo e o vitest saía com erro não tratado —
    com todos os testes verdes.
  */
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    update: vi.fn(),
    dismiss: vi.fn(),
  },
}));
vi.mock("@/components/templates/modalTemplate", () => ({
  default: ({
    children,
    isOpen,
  }: {
    children: React.ReactNode;
    isOpen: boolean;
  }) => (isOpen ? <div>{children}</div> : null),
}));

import { ModalShowQuestion } from "./modalShowQuestion";

const questao = {
  _id: "q2",
  text: "Detalhe a renda",
  helpText: "Some a renda de todos (valores de 2025)",
  answerType: AnswerType.Text,
  collection: AnswerCollectionType.Single,
  active: true,
  conditions: {
    logic: Logic.And,
    conditions: [
      { questionId: "q1", operator: Operator.NotEqual, expectedValue: "0" },
    ],
  },
} as unknown as QuestionForm;

describe("ModalShowQuestion — Cancelar (tickets-documentacao, 25)", () => {
  it("⚠️ Editar → Cancelar mantém as condições na tela", () => {
    render(
      <ModalShowQuestion
        isOpen
        handleClose={vi.fn()}
        question={questao}
        availableQuestions={[]}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText("1 condição(ões)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Editar/ }));
    fireEvent.click(screen.getByRole("button", { name: /Cancelar/ }));

    expect(screen.getByText("1 condição(ões)")).toBeInTheDocument();
    expect(screen.queryByText("Nenhuma condição definida")).toBeNull();
  });
});

describe("ModalShowQuestion — apagar ajuda e remover condições (tickets-documentacao, 22)", () => {
  it("⚠️ salva helpText vazio e conditions null", async () => {
    const updateFn = vi.fn().mockResolvedValue(undefined);
    render(
      <ModalShowQuestion
        isOpen
        handleClose={vi.fn()}
        question={questao}
        availableQuestions={[]}
        onEdit={vi.fn()}
        updateFn={updateFn}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Editar/ }));
    fireEvent.change(screen.getByLabelText("Texto de Ajuda"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Remover condições/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Confirmar" }));
    expect(screen.getByText("Nenhuma condição definida")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Salvar/ }));
    await waitFor(() => expect(updateFn).toHaveBeenCalled());
    const enviado = updateFn.mock.calls[0][2];
    expect(enviado.helpText).toBe("");
    expect(enviado.conditions).toBeNull();
  });

  it("sem remover, as condições vão como estão", async () => {
    const updateFn = vi.fn().mockResolvedValue(undefined);
    render(
      <ModalShowQuestion
        isOpen
        handleClose={vi.fn()}
        question={questao}
        availableQuestions={[]}
        onEdit={vi.fn()}
        updateFn={updateFn}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Editar/ }));
    fireEvent.click(screen.getByRole("button", { name: /Salvar/ }));
    await waitFor(() => expect(updateFn).toHaveBeenCalled());
    expect(updateFn.mock.calls[0][2].conditions).toEqual(questao.conditions);
  });
});
