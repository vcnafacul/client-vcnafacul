import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ConfirmEnrolledLogin } from "@/pages/confirmEnrolled/confirmEnrolledLogin";
import { PartnerPrepInscriptionStepLogin } from "@/pages/partnerPrepInscription/steps/partnerPrepInscriptionStepLogin";
import { PartnerPrepInscriptionStepRegister } from "@/pages/partnerPrepInscription/steps/partnerPrepInscriptionStepRegister";

/*
  Card 04 de `login-com-google`: o botão do Google, nos fluxos que não são o
  /login, tem de levar o caminho atual — a ida ao Google recarrega a página.
*/
vi.mock("@/components/atoms/googleAuthButton", () => ({
  default: ({ label, voltar }: { label: string; voltar?: string }) => (
    <button data-google data-voltar={voltar ?? ""}>
      {label}
    </button>
  ),
}));
vi.mock("@/components/organisms/loginForm", () => ({ default: () => null }));
vi.mock("@/components/organisms/registerForm", () => ({
  default: ({ google }: { google?: { voltar?: string } }) => (
    <button data-google data-voltar={google?.voltar ?? ""} />
  ),
}));

const voltarEm = (url: string, ui: React.ReactElement) => {
  const { container } = render(
    <MemoryRouter initialEntries={[url]}>{ui}</MemoryRouter>,
  );
  return container.querySelector("[data-google]")?.getAttribute("data-voltar");
};

describe("botão do Google volta para onde a pessoa estava", () => {
  it("login da inscrição de cursinho", () => {
    expect(
      voltarEm(
        "/cursinho/inscricao/abc123",
        <PartnerPrepInscriptionStepLogin setStepCurrently={() => {}} />,
      ),
    ).toBe("/cursinho/inscricao/abc123");
  });

  it("cadastro da inscrição de cursinho", () => {
    expect(
      voltarEm(
        "/cursinho/inscricao/abc123",
        <PartnerPrepInscriptionStepRegister inscriptionId="abc123" />,
      ),
    ).toBe("/cursinho/inscricao/abc123");
  });

  it("login da confirmação de matrícula (com a query)", () => {
    expect(
      voltarEm("/declarar-interesse/xyz?origem=email", <ConfirmEnrolledLogin />),
    ).toBe("/declarar-interesse/xyz?origem=email");
  });
});
