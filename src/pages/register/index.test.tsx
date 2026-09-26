import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Register from ".";

const buscarConvitePorToken = vi.hoisted(() => vi.fn());
const cadastrarPeloConvite = vi.hoisted(() => vi.fn());
vi.mock("@/services/prepCourse/conviteColaborador", () => ({
  buscarConvitePorToken,
  cadastrarPeloConvite,
}));
const registerUser = vi.hoisted(() => vi.fn());
vi.mock("@/services/auth/registerUser", () => ({ registerUser }));
vi.mock("@/utils/decodedUser", () => ({
  decoderUser: (t: string) => ({ token: t }),
}));
const doAuth = vi.hoisted(() => vi.fn());
vi.mock("@/store/auth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/store/auth")>()),
  useAuthStore: () => ({ doAuth }),
}));
vi.mock("@/components/templates/baseTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

/*
  ⚠️ O formulário real tem dois passos com validação de senha, data e LGPD —
  não interessa aqui. O dublê expõe o que a página passa a ele e um botão
  que dispara o `onRegister`.
*/
vi.mock("@/components/organisms/registerForm", () => ({
  default: ({
    emailTravado,
    onRegister,
    google,
  }: {
    emailTravado?: string;
    onRegister: (d: unknown) => Promise<void>;
    google?: { voltar?: string; convite?: string };
  }) => (
    <div
      data-register-form
      data-email-travado={emailTravado ?? ""}
      data-google={google ? JSON.stringify(google) : ""}
    >
      <button
        onClick={() =>
          onRegister({ email: emailTravado ?? "livre@x.com", gender: "1" }).catch(
            () => undefined,
          )
        }
      >
        cadastrar
      </button>
    </div>
  ),
}));

const convite = (over = {}) => ({
  nomeCursinho: "Cursinho Popular",
  funcao: "Professor",
  email: "ana@x.com",
  situacao: "pendente",
  expiraEm: "2026-10-01",
  temConta: false,
  ...over,
});

const montar = (search: string) =>
  render(
    <MemoryRouter initialEntries={[`/cadastro${search}`]}>
      <Routes>
        <Route path="/cadastro" element={<Register />} />
        <Route path="/convite-colaborador" element={<div data-pagina-convite />} />
        <Route path="*" element={<div data-painel />} />
      </Routes>
    </MemoryRouter>,
  );

describe("Register — cadastro pelo convite (convite 05)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buscarConvitePorToken.mockResolvedValue(convite());
    cadastrarPeloConvite.mockResolvedValue({ access_token: "sessao" });
    registerUser.mockResolvedValue(undefined);
  });

  it("⚠️ com convite: mostra o cursinho e trava o email do convite", async () => {
    const { container } = montar("?convite=abc");

    expect(await screen.findByText(/Cursinho Popular/)).toBeTruthy();
    expect(
      container.querySelector("[data-register-form]")?.getAttribute("data-email-travado"),
    ).toBe("ana@x.com");
  });

  it("⚠️ cadastrar pelo convite já sai logado — e não pelo cadastro normal", async () => {
    const { container } = montar("?convite=abc");

    fireEvent.click(await screen.findByText("cadastrar"));

    await waitFor(() => expect(container.querySelector("[data-painel]")).toBeTruthy());
    expect(cadastrarPeloConvite).toHaveBeenCalledWith(
      "abc",
      expect.objectContaining({ email: "ana@x.com" }),
    );
    expect(doAuth).toHaveBeenCalledWith({ token: "sessao" });
    expect(registerUser).not.toHaveBeenCalled();
  });

  it("⚠️ o formulário só aparece depois de o convite chegar — senão o email não trava", async () => {
    let resolver: (c: unknown) => void = () => undefined;
    buscarConvitePorToken.mockReturnValue(new Promise((r) => (resolver = r)));
    const { container } = montar("?convite=abc");

    expect(container.querySelector("[data-register-form]")).toBeNull();
    resolver(convite());
    await waitFor(() =>
      expect(container.querySelector("[data-register-form]")).toBeTruthy(),
    );
  });

  it("email que já tem conta: leva à página do link, para entrar e aceitar", async () => {
    buscarConvitePorToken.mockResolvedValue(convite({ temConta: true }));
    const { container } = montar("?convite=abc");

    await waitFor(() =>
      expect(container.querySelector("[data-pagina-convite]")).toBeTruthy(),
    );
  });

  it("convite expirado: avisa, e o cadastro normal continua disponível", async () => {
    buscarConvitePorToken.mockResolvedValue(convite({ situacao: "expirado" }));
    const { container } = montar("?convite=abc");

    expect(await screen.findByText(/não vale mais/)).toBeTruthy();
    expect(
      container.querySelector("[data-register-form]")?.getAttribute("data-email-travado"),
    ).toBe("");
  });

  it("sem convite: o cadastro de sempre", async () => {
    montar("");

    fireEvent.click(await screen.findByText("cadastrar"));

    await waitFor(() => expect(registerUser).toHaveBeenCalled());
    expect(buscarConvitePorToken).not.toHaveBeenCalled();
    expect(cadastrarPeloConvite).not.toHaveBeenCalled();
  });
});

describe("Register — botão do Google (login-com-google)", () => {
  const google = (container: HTMLElement) =>
    container.querySelector("[data-register-form]")?.getAttribute("data-google");

  beforeEach(() => {
    vi.clearAllMocks();
    buscarConvitePorToken.mockResolvedValue(convite());
  });

  it("sem convite: o formulário oferece o Google, sem convite", () => {
    const { container } = montar("");
    expect(google(container)).toBe("{}");
  });

  it("⚠️ com convite: o Google leva o convite e volta à página dele (card 05)", async () => {
    const { container } = montar("?convite=abc");
    await screen.findByText(/Cursinho Popular/);
    expect(JSON.parse(google(container)!)).toEqual({
      convite: "abc",
      voltar: "/convite-colaborador?token=abc",
    });
  });

  it("convite que não vale mais: o Google comum, sem o convite", async () => {
    buscarConvitePorToken.mockResolvedValue(convite({ situacao: "expirado" }));
    const { container } = montar("?convite=abc");
    await screen.findByText(/não vale mais/);
    expect(google(container)).toBe("{}");
  });
});
