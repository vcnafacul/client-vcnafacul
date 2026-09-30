import { QuestionForm } from "@/types/partnerPrepForm/questionForm";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RenderQuestionsTable } from "./renderQuestionsTable";

// Força o layout do celular (abaixo de 768px).
vi.mock("@/components/dashV2/useAcimaDeSm", () => ({
  useAcimaDeSm: () => false,
}));

const questao = (i: number): QuestionForm =>
  ({
    _id: `q-${i}`,
    text: `Pergunta ${i}`,
    answerType: "Text",
    collection: "single",
    active: true,
    order: i,
    createdAt: new Date(2026, 0, 1),
    updatedAt: new Date(2026, 0, 1),
  }) as unknown as QuestionForm;

const renderizar = (
  props: Partial<Parameters<typeof RenderQuestionsTable>[0]> = {},
) => {
  const onReorderQuestions = vi.fn();
  const deleteFn = vi.fn().mockResolvedValue(undefined);
  render(
    <RenderQuestionsTable
      questions={[questao(1), questao(2), questao(3)]}
      onDeleteQuestion={vi.fn()}
      onChangeQuestion={vi.fn()}
      onReorderQuestions={onReorderQuestions}
      deleteFn={deleteFn}
      {...props}
    />,
  );
  return { onReorderQuestions, deleteFn };
};

describe("RenderQuestionsTable no celular", () => {
  it("↑/↓ reordenam pela mesma chamada do arrastar", () => {
    const { onReorderQuestions } = renderizar();
    const baixo = screen.getAllByRole("button", { name: "Mover para baixo" });
    fireEvent.click(baixo[0]);
    expect(
      onReorderQuestions.mock.calls[0][0].map((q: QuestionForm) => q._id),
    ).toEqual(["q-2", "q-1", "q-3"]);
    expect(
      screen.getAllByRole("button", { name: "Mover para cima" })[0],
    ).toBeDisabled();
    expect(baixo[2]).toBeDisabled();
  });

  it("excluir pede confirmação", () => {
    const { deleteFn } = renderizar();
    fireEvent.click(screen.getAllByRole("button", { name: "Excluir" })[0]);
    expect(deleteFn).not.toHaveBeenCalled();
    expect(screen.getByText("Excluir esta questão?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(deleteFn).toHaveBeenCalledWith(expect.anything(), "q-1");
  });

  it("somente leitura: sem mover e sem excluir", () => {
    renderizar({ readOnly: true });
    expect(
      screen.queryByRole("button", { name: "Mover para cima" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Excluir" })).toBeNull();
    expect(screen.getAllByText(/Pergunta/)).toHaveLength(3);
  });
});
