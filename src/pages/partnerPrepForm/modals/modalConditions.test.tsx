import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  AnswerCollectionType,
  AnswerType,
  QuestionForm,
} from "@/types/partnerPrepForm/questionForm";

vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/components/templates/modalTemplate", () => ({
  default: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
    isOpen ? <div>{children}</div> : null,
}));

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
    fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
    const lista = within(screen.getByRole("listbox"));
    expect(lista.queryByText("Renda")).toBeNull();
    expect(lista.getByText("Idade")).toBeInTheDocument();
    expect(lista.getByText("Número")).toBeInTheDocument();
  });
});
