import { QuestionBoxStatus } from "@/enums/simulado/questionBoxStatus";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Força o layout do celular (abaixo de 768px).
vi.mock("@/components/dashV2/useAcimaDeSm", () => ({
  useAcimaDeSm: () => false,
}));
vi.mock("../../atoms/richTextRenderer/RichTextRenderer", () => ({
  default: ({ content }: { content: string }) => <div>{content}</div>,
}));

import SimulateTemplate, { QuestionTemplate } from ".";

const questoes = Array.from({ length: 3 }, (_, i) => ({
  id: `q${i}`,
  number: i,
  status: i === 0 ? QuestionBoxStatus.active : QuestionBoxStatus.unread,
}));

const questao = (over: Partial<QuestionTemplate> = {}): QuestionTemplate => ({
  _id: "q0",
  enemArea: "Matemática",
  imageId: "img",
  numero: 0,
  ...over,
});

const montar = (q: QuestionTemplate, selectQuestion = vi.fn()) => {
  const r = render(
    <SimulateTemplate
      header={<div />}
      questions={questoes}
      selectQuestion={selectQuestion}
      questionSelected={q}
      questionImageUrl="blob:img"
      legends={[]}
      expandedPhoto={vi.fn()}
      alternative={<div />}
      buttons={<div />}
      respondidas={1}
    />,
  );
  return { ...r, selectQuestion };
};

describe("SimulateTemplate no celular", () => {
  it("grade recolhida com resumo; abre, escolhe e fecha", () => {
    const { selectQuestion } = montar(questao());
    const resumo = screen.getByRole("button", { name: /1\/3 respondidas/ });
    expect(screen.queryByText("2")).toBeNull();

    fireEvent.click(resumo);
    fireEvent.click(screen.getByText("2"));

    expect(selectQuestion).toHaveBeenCalledWith(1);
    expect(screen.queryByText("2")).toBeNull();
  });

  it("questão com texto abre em texto", async () => {
    montar(questao({ textoQuestao: "Enunciado em texto" }));
    expect(await screen.findByText("Enunciado em texto")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ver imagem" }),
    ).toBeInTheDocument();
  });

  it("⚠️ questão só com imagem mostra a imagem mesmo no modo texto", () => {
    const { container } = montar(questao());
    expect(container.querySelector('img[src="blob:img"]')).not.toBeNull();
  });
});
