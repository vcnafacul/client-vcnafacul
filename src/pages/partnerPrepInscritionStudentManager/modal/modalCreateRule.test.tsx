import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  AnswerCollectionType,
  AnswerType,
  QuestionForm,
} from "@/types/partnerPrepForm/questionForm";

vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { ModalCreateRule } from "./modalCreateRule";

const pergunta = (
  _id: string,
  text: string,
  answerType: AnswerType,
  options?: string[],
) =>
  ({
    _id,
    text,
    answerType,
    options,
    collection: AnswerCollectionType.Single,
    active: true,
  }) as unknown as QuestionForm;

describe("ModalCreateRule (tickets/059/01, R33)", () => {
  it("o listbox da pergunta vinculada está na árvore de acessibilidade e a escolha mostra a pontuação por opção", () => {
    render(
      <ModalCreateRule
        isOpen
        handleClose={vi.fn()}
        onSuccess={vi.fn()}
        questions={[
          pergunta("p1", "Cor", AnswerType.Options, ["Azul", "Verde"]),
          pergunta("p2", "Renda", AnswerType.Number),
        ]}
      />,
    );
    const gatilho = screen.getByRole("combobox", { name: /Pergunta Vinculada/ });
    // Sem escolha implícita: o placeholder aparece, não a primeira pergunta (R36).
    expect(gatilho).toHaveTextContent("Selecione uma pergunta");

    fireEvent.keyDown(gatilho, { key: "Enter" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("option", { name: "Cor" }));

    expect(screen.getByText("Pontuação por Opção")).toBeInTheDocument();
    expect(screen.getByLabelText("Pontos para Azul")).toHaveValue(0);
  });

  it("Criar Regra sem preencher mostra os erros embaixo dos campos", () => {
    render(
      <ModalCreateRule isOpen handleClose={vi.fn()} onSuccess={vi.fn()} questions={[]} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Criar Regra" }));
    expect(screen.getByText("Nome é obrigatório")).toBeInTheDocument();
    expect(screen.getByText("Descrição é obrigatória")).toBeInTheDocument();
    expect(screen.getAllByText("Selecione uma pergunta")).toHaveLength(2); // placeholder e erro
  });
});
