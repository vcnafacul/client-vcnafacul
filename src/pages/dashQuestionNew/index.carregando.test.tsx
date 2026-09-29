import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const svc = vi.hoisted(() => ({
  getAllQuestions: vi.fn(),
  getInfosQuestion: vi.fn(),
}));
vi.mock("@/services/question/getAllQuestion", () => ({
  getAllQuestions: svc.getAllQuestions,
}));
vi.mock("@/services/question/getInfosQuestion", () => ({
  getInfosQuestion: svc.getInfosQuestion,
}));
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
vi.mock("./modals/ModalQuestionDetailsRefactored", () => ({
  ModalQuestionDetailsRefactored: () => null,
}));
vi.mock("./modals/ModalCreateQuestion", () => ({
  ModalCreateQuestion: () => null,
}));
vi.mock("./components/simpleQuestionCard", () => ({
  SimpleQuestionCard: ({ question }: { question: { _id: string } }) => (
    <div data-card>{question._id}</div>
  ),
}));

import DashQuestionNew from ".";

const esqueletos = () => document.querySelectorAll(".animate-pulse").length;

describe("Banco de questões — carregando", () => {
  beforeEach(() => vi.clearAllMocks());

  it("⚠️ antes da primeira carga: skeleton, e NÃO 'Nenhuma questão encontrada'", () => {
    svc.getInfosQuestion.mockReturnValue(new Promise(() => {}));
    svc.getAllQuestions.mockReturnValue(new Promise(() => {}));
    render(<DashQuestionNew />);
    expect(esqueletos()).toBeGreaterThan(0);
    expect(screen.queryByText("Nenhuma questão encontrada")).toBeNull();
    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("⚠️ as questões não esperam os infos (a carga pesada)", async () => {
    svc.getInfosQuestion.mockReturnValue(new Promise(() => {})); // nunca chega
    svc.getAllQuestions.mockResolvedValue({
      data: [{ _id: "q1" }, { _id: "q2" }],
      totalItems: 2,
    });
    render(<DashQuestionNew />);
    await waitFor(() =>
      expect(document.querySelectorAll("[data-card]")).toHaveLength(2),
    );
    expect(esqueletos()).toBe(0);
  });

  it("lista vazia de verdade: aí sim 'Nenhuma questão encontrada'", async () => {
    svc.getInfosQuestion.mockResolvedValue({ provas: [] });
    svc.getAllQuestions.mockResolvedValue({ data: [], totalItems: 0 });
    render(<DashQuestionNew />);
    expect(
      await screen.findByText("Nenhuma questão encontrada"),
    ).toBeInTheDocument();
  });
});
