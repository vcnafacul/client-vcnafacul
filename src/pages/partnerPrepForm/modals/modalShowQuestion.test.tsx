import { fireEvent, render, screen } from "@testing-library/react";
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
  toast: { success: vi.fn(), error: vi.fn(), loading: vi.fn() },
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
  helpText: "",
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
