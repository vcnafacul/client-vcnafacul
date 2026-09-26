import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { PartnerPrepInscriptionStepRegister } from "./partnerPrepInscriptionStepRegister";

const registerUserFlowStudent = vi.hoisted(() => vi.fn());
vi.mock("@/services/prepCourse/student/registerUserFlowStudent", () => ({
  registerUserFlowStudent,
}));

/*
  O dublê faz o que o passo 2 real faz: espera o `onRegister` e mostra o
  resultado — é o que decide entre o toast de erro e a tela de sucesso.
*/
vi.mock("@/components/organisms/registerForm", () => ({
  default: ({ onRegister }: { onRegister: (d: unknown) => Promise<void> }) => (
    <button
      onClick={(e) => {
        const botao = e.currentTarget;
        onRegister({ email: "a@x.com" }).then(
          () => (botao.textContent = "sucesso"),
          () => (botao.textContent = "erro"),
        );
      }}
    >
      cadastrar
    </button>
  ),
}));

const montar = () =>
  render(
    <MemoryRouter initialEntries={["/cursinho/inscricao/abc"]}>
      <PartnerPrepInscriptionStepRegister inscriptionId="abc" />
    </MemoryRouter>,
  );

describe("PartnerPrepInscriptionStepRegister", () => {
  it("cadastra pelo fluxo do estudante, com o id da inscrição", async () => {
    registerUserFlowStudent.mockResolvedValue(undefined);
    montar();
    fireEvent.click(screen.getByText("cadastrar"));

    expect(await screen.findByText("sucesso")).toBeTruthy();
    expect(registerUserFlowStudent).toHaveBeenCalledWith({ email: "a@x.com" }, "abc");
  });

  it("⚠️ a api recusou: o formulário recebe o erro — não mostra sucesso", async () => {
    registerUserFlowStudent.mockRejectedValue(new Error("Email already exist"));
    montar();
    fireEvent.click(screen.getByText("cadastrar"));

    await waitFor(() => expect(screen.getByText("erro")).toBeTruthy());
  });
});
