import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Login, { ERROS_DO_GOOGLE } from ".";

const toastError = vi.hoisted(() => vi.fn());
vi.mock("react-toastify", () => ({ toast: { error: toastError } }));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "" } }),
}));
vi.mock("../../components/organisms/loginForm", () => ({
  default: () => <div data-login-form />,
}));
vi.mock("../../components/templates/baseTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const montar = (search = "") =>
  render(
    <MemoryRouter initialEntries={[`/login${search}`]}>
      <Login />
    </MemoryRouter>,
  );

describe("Login — Google (login-com-google 03)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("oferece entrar com Google", () => {
    montar();
    expect(screen.getByText("Entrar com Google")).toBeTruthy();
    expect(toastError).not.toHaveBeenCalled();
  });

  it.each([
    ["google", ERROS_DO_GOOGLE.google],
    ["conta-removida", ERROS_DO_GOOGLE["conta-removida"]],
    ["desconhecido", ERROS_DO_GOOGLE.google],
  ])("?erro=%s mostra o aviso", (erro, mensagem) => {
    montar(`?erro=${erro}`);
    expect(toastError).toHaveBeenCalledWith(mensagem, expect.anything());
  });
});
