import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/public/impactStats", () => ({
  fetchImpactStats: vi.fn().mockResolvedValue({
    studentsServed: 10,
    partnerCourses: 2,
    studentsEnrolled: 3,
    questionsTotal: 4,
    contentApproved: 0,
    selectionProcesses: 5,
  }),
}));

import { ImpactoSection } from "./ImpactoSection";

/** tickets/025: o `ImpactCard` saiu daqui, a seção continua a mesma. */
describe("ImpactoSection da Quem Somos", () => {
  it("continua com os 5 cards, inclusive Cursinhos parceiros", async () => {
    render(<ImpactoSection />);
    expect(await screen.findByText("10")).toBeInTheDocument();
    for (const rotulo of [
      "Estudantes atendidos",
      "Cursinhos parceiros",
      "Estudantes ativos",
      "Questões cadastradas",
      "Processos seletivos",
    ]) {
      expect(screen.getByText(rotulo)).toBeInTheDocument();
    }
  });
});
