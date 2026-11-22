import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  AnswerCollectionType,
  AnswerType,
  QuestionForm,
} from "@/types/partnerPrepForm/questionForm";

vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { ModalConditions } from "./modalConditions";

const q = (_id: string, text: string, answerType = AnswerType.Text) =>
  ({
    _id,
    text,
    answerType,
    collection: AnswerCollectionType.Single,
    active: true,
  }) as unknown as QuestionForm;

describe("ModalConditions (tickets-documentacao, 27)", () => {
  it("⚠️ a própria questão não aparece como referência; tipos em português", () => {
    render(
      <ModalConditions
        isOpen
        handleClose={vi.fn()}
        availableQuestions={[q("renda", "Renda"), q("idade", "Idade", AnswerType.Number)]}
        questaoId="renda"
        onSave={vi.fn()}
      />,
    );
    fireEvent.keyDown(screen.getAllByRole("combobox")[0], { key: "Enter" });
    // O pop-up do ui/select fica dentro do Dialog e continua na árvore de acessibilidade.
    const lista = within(screen.getByRole("listbox"));
    expect(lista.queryByText("Renda")).toBeNull();
    expect(lista.getByText("Idade")).toBeInTheDocument();
    expect(lista.getByText("Número")).toBeInTheDocument();
  });
});
