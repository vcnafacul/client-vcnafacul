import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RegisterForm from ".";

vi.mock("@/components/atoms/googleAuthButton", () => ({
  default: ({ label, convite }: { label: string; convite?: string }) => (
    <button data-google data-convite={convite ?? ""}>
      {label}
    </button>
  ),
}));
vi.mock("./setps/step1", () => ({
  default: ({ updateData }: { updateData: (d: object) => void }) => (
    <button data-step1 onClick={() => updateData({ email: "a@x.com" })}>
      continuar
    </button>
  ),
}));
vi.mock("./setps/step2", () => ({ default: () => <div data-step2 /> }));

const montar = (google?: { voltar?: string; convite?: string }) =>
  render(
    <RegisterForm
      title="Cadastre-se"
      titleSuccess="ok"
      onRegister={vi.fn()}
      google={google}
    />,
  );

describe("RegisterForm — Cadastrar com Google", () => {
  it("⚠️ no topo do passo 1 — antes dos campos, senão fica fora da vista", () => {
    const { container } = montar({});
    const botao = container.querySelector("[data-google]")!;
    const passo1 = container.querySelector("[data-step1]")!;
    expect(
      botao.compareDocumentPosition(passo1) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByText("ou com email e senha")).toBeTruthy();
  });

  it("leva o convite adiante", () => {
    montar({ convite: "tok" });
    expect(screen.getByText("Cadastrar com Google").getAttribute("data-convite")).toBe("tok");
  });

  it("sem a prop, sem botão", () => {
    const { container } = montar();
    expect(container.querySelector("[data-google]")).toBeNull();
  });

  it("⚠️ só no passo 1 — no passo 2 a pessoa já escolheu email e senha", () => {
    const { container } = montar({});
    fireEvent.click(screen.getByText("continuar"));
    expect(container.querySelector("[data-step2]")).toBeTruthy();
    expect(container.querySelector("[data-google]")).toBeNull();
  });
});
