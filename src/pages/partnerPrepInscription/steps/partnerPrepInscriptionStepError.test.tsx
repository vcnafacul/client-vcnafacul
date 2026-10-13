import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { PartnerPrepInscriptionStepError } from "./partnerPrepInscriptionStepError";

const renderStep = (alreadyInscribed?: boolean) =>
  render(
    <MemoryRouter>
      <PartnerPrepInscriptionStepError
        message="msg"
        alreadyInscribed={alreadyInscribed}
      />
    </MemoryRouter>,
  );

describe("PartnerPrepInscriptionStepError", () => {
  it("quem já se inscreveu vai para minhas inscrições", () => {
    renderStep(true);
    expect(
      screen.getByRole("link", { name: "Ir para minhas inscrições" }),
    ).toHaveAttribute("href", "/dashboard/acompanhamento-inscricoes");
  });

  it("nos demais erros continua indo para a página inicial", () => {
    renderStep();
    expect(
      screen.getByRole("link", { name: "Ir para a Página Inicial" }),
    ).toBeInTheDocument();
  });
});
