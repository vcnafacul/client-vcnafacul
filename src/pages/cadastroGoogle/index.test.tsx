import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CadastroGoogle from ".";

const buscarCadastroGoogle = vi.hoisted(() => vi.fn());
const concluirCadastroGoogle = vi.hoisted(() => vi.fn());
vi.mock("@/services/auth/google", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/services/auth/google")>()),
  buscarCadastroGoogle,
  concluirCadastroGoogle,
}));
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

/*
  ⚠️ O formulário real (o passo 2 do cadastro) já tem os seus testes de
  validação. O dublê mostra o que a página passa e dispara o `onRegister`
  como o formulário faria: nascimento em ISO, gênero como string do select.
*/
const step2 = vi.hoisted(() => vi.fn());
vi.mock("@/components/organisms/registerForm/setps/step2", () => ({
  default: (props: {
    valoresIniciais?: { firstName?: string };
    back?: () => void;
    onRegister: (d: unknown) => Promise<void>;
  }) => {
    step2(props);
    return (
      <button
        data-nome={props.valoresIniciais?.firstName}
        onClick={() =>
          props
            .onRegister({
              email: "ignorado@x.com",
              password: "nao-vai",
              firstName: "Ana Maria",
              lastName: "Souza",
              socialName: "",
              phone: "11",
              gender: "2",
              birthday: "2000-05-10T00:00:00.000Z",
              state: "SP",
              city: "São Paulo",
              lgpd: true,
            })
            .catch(() => undefined)
        }
      >
        cadastrar
      </button>
    );
  },
}));

function Onde() {
  return <div data-testid="onde">{useLocation().pathname}</div>;
}

const montar = () =>
  render(
    <MemoryRouter initialEntries={["/cadastro/google"]}>
      <Routes>
        <Route path="/cadastro/google" element={<CadastroGoogle />} />
        <Route path="*" element={<Onde />} />
      </Routes>
    </MemoryRouter>,
  );

describe("CadastroGoogle (login-com-google 03)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buscarCadastroGoogle.mockResolvedValue({
      email: "ana@gmail.com",
      firstName: "Ana",
      lastName: "Silva",
    });
    concluirCadastroGoogle.mockResolvedValue({
      access_token: "sessao",
      voltar: "/inscricao",
    });
  });

  it("mostra o email do Google e sugere o nome, sem passo anterior", async () => {
    montar();

    expect(await screen.findByText("ana@gmail.com")).toBeTruthy();
    expect(screen.getByText("cadastrar").getAttribute("data-nome")).toBe("Ana");
    expect(step2.mock.calls[0][0].back).toBeUndefined();
  });

  it("⚠️ conclui sem mandar email nem senha, entra e vai para o voltar", async () => {
    montar();
    fireEvent.click(await screen.findByText("cadastrar"));

    await waitFor(() =>
      expect(screen.getByTestId("onde").textContent).toBe("/inscricao"),
    );
    const enviado = concluirCadastroGoogle.mock.calls[0][0];
    expect(enviado).not.toHaveProperty("email");
    expect(enviado).not.toHaveProperty("password");
    expect(enviado).toMatchObject({ gender: 2, socialName: undefined, lgpd: true });
    expect(doAuth).toHaveBeenCalledWith({ token: "sessao" });
  });

  it("⚠️ cadastro vencido (401): mostra o aviso e o botão para recomeçar", async () => {
    const { ErroDoCadastroGoogle } = await import("@/services/auth/google");
    buscarCadastroGoogle.mockRejectedValue(new ErroDoCadastroGoogle("x", 401));
    montar();

    expect(await screen.findByText(/tempo para concluir o cadastro acabou/)).toBeTruthy();
    expect(screen.getByText("Entrar com Google de novo")).toBeTruthy();
    expect(screen.queryByText("cadastrar")).toBeNull();
  });

  it("venceu no envio: troca o formulário pelo aviso", async () => {
    const { ErroDoCadastroGoogle } = await import("@/services/auth/google");
    concluirCadastroGoogle.mockRejectedValue(new ErroDoCadastroGoogle("x", 401));
    montar();
    fireEvent.click(await screen.findByText("cadastrar"));

    expect(await screen.findByText(/tempo para concluir o cadastro acabou/)).toBeTruthy();
    expect(doAuth).not.toHaveBeenCalled();
  });
});
