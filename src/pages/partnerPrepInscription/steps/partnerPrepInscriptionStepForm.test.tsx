import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PartnerPrepInscriptionStepForm } from "./partnerPrepInscriptionStepForm";
import { SectionForm } from "@/types/partnerPrepForm/sectionForm";

const secao = {
  _id: "s1",
  name: "Dados pessoais",
  description: "",
  questions: [],
} as unknown as SectionForm;

describe("PartnerPrepInscriptionStepForm: outline", () => {
  it("o nome da seção é h2: o único h1 da tela é o do index", async () => {
    render(
      <PartnerPrepInscriptionStepForm
        section={secao}
        allAnswers={{}}
        isLastSection={false}
        isFirstSection
        onAdvance={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    expect(
      await screen.findByRole("heading", { level: 2, name: "Dados pessoais" }),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("heading", { level: 1 })).toHaveLength(0);
  });
});
