import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { SectionForm } from "@/types/partnerPrepForm/sectionForm";
import { QuestionForm } from "@/types/partnerPrepForm/questionForm";

vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "t" } }),
}));

import { ExpandableSection } from "./expandableSection";
import { SortableQuestionRow } from "./sortableQuestionRow";

const questao = (i: number, active = true) =>
  ({
    _id: `q-${i}`,
    text: `Pergunta ${i}`,
    answerType: "Text",
    collection: "single",
    active,
    createdAt: new Date(2026, 0, 1),
    updatedAt: new Date(2026, 0, 1),
  }) as unknown as QuestionForm;

const secao = (extra: Partial<SectionForm> = {}) =>
  ({
    _id: "s1",
    name: "Dados pessoais",
    active: true,
    isGlobal: false,
    questions: [questao(1), questao(2, false)],
    createdAt: new Date(2026, 0, 1),
    updatedAt: new Date(2026, 0, 1),
    ...extra,
  }) as unknown as SectionForm;

const montar = (section: SectionForm) =>
  render(
    <table>
      <tbody>
        <ExpandableSection
          section={section}
          setSection={vi.fn()}
          handleAddQuestion={vi.fn()}
          handleEditSection={vi.fn()}
          handleDeleteSection={vi.fn()}
          handleToggleSection={vi.fn()}
          handleReorderQuestions={vi.fn()}
          handleDuplicateSection={vi.fn()}
        />
      </tbody>
    </table>,
  );

describe("ExpandableSection", () => {
  it("expande e recolhe as questões com aria-expanded e aria-controls", () => {
    montar(secao());
    const botao = screen.getByRole("button", {
      name: "Expandir questões de Dados pessoais",
    });
    expect(botao).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("table", { name: "questões" })).toBeNull();

    fireEvent.click(botao);
    const aberto = screen.getByRole("button", {
      name: "Recolher questões de Dados pessoais",
    });
    expect(aberto).toHaveAttribute("aria-expanded", "true");
    expect(
      document.getElementById(aberto.getAttribute("aria-controls") as string),
    ).toContainElement(screen.getByRole("table", { name: "questões" }));

    fireEvent.click(aberto);
    expect(screen.queryByRole("table", { name: "questões" })).toBeNull();
  });

  it("mostra o selo Ativo/Inativo e o Global em seção global", () => {
    const { unmount } = montar(secao());
    expect(screen.getByText("Ativo")).toBeInTheDocument();
    expect(screen.queryByText("Global")).toBeNull();
    unmount();
    montar(secao({ active: false, isGlobal: true }));
    expect(screen.getByText("Inativo")).toBeInTheDocument();
    expect(screen.getByText("Global")).toBeInTheDocument();
    expect(screen.getByText("Somente leitura")).toBeInTheDocument();
  });
});

describe("SortableQuestionRow", () => {
  it("a alça de arraste continua ligada ao dnd-kit e o selo diz o estado", () => {
    render(
      <DndContext>
        <SortableContext items={["q-1"]}>
          <table>
            <tbody>
              <SortableQuestionRow question={questao(1, false)} onView={vi.fn()} />
            </tbody>
          </table>
        </SortableContext>
      </DndContext>,
    );
    expect(
      screen.getByRole("button", { name: "Arrastar a questão para reordenar" }),
    ).toHaveAttribute("aria-roledescription", "sortable");
    expect(screen.getByText("Inativo")).toBeInTheDocument();
    expect(screen.getByText("Texto")).toBeInTheDocument();
    expect(screen.getByText("Única")).toBeInTheDocument();
  });
});
