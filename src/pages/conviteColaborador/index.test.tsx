import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ConviteColaborador from ".";

const buscarConvitePorToken = vi.hoisted(() => vi.fn());
const aceitarConvite = vi.hoisted(() => vi.fn());
vi.mock("@/services/prepCourse/conviteColaborador", () => ({
  buscarConvitePorToken,
  aceitarConvite,
}));
const refreshToken = vi.hoisted(() => vi.fn());
vi.mock("@/services/auth/refresh", () => ({ refreshToken }));
vi.mock("@/utils/decodedUser", () => ({
  decoderUser: (t: string) => ({ token: t }),
}));
// ⚠️ O formulário real de login não interessa aqui — só que ele aparece.
vi.mock("@/components/organisms/loginForm", () => ({
  default: () => <div data-login-form />,
}));
vi.mock("@/components/templates/baseTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const estado = vi.hoisted(() => ({
  token: "",
  email: "",
  doAuth: vi.fn(),
}));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({
    data: { token: estado.token, user: { email: estado.email } },
    doAuth: estado.doAuth,
  }),
}));

const convite = (over = {}) => ({
  nomeCursinho: "Cursinho Popular",
  funcao: "Professor",
  email: "ana@x.com",
  situacao: "pendente",
  expiraEm: "2026-10-01",
  temConta: true,
  ...over,
});

const montar = (search = "?token=abc") =>
  render(
    <MemoryRouter initialEntries={[`/convite-colaborador${search}`]}>
      <ConviteColaborador />
    </MemoryRouter>,
  );

describe("ConviteColaborador (convite 04)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    estado.token = "login";
    estado.email = "Ana@X.com";
    buscarConvitePorToken.mockResolvedValue(convite());
    aceitarConvite.mockResolvedValue(undefined);
    refreshToken.mockResolvedValue({ access_token: "novo" });
  });

  it("⚠️ mostra cursinho e função ANTES de aceitar — não aceita ao abrir", async () => {
    // A página antiga aceitava no carregamento, sem a pessoa decidir.
    montar();

    expect(await screen.findByText(/Convite para o Cursinho Popular/)).toBeTruthy();
    expect(screen.getByText("Professor")).toBeTruthy();
    expect(aceitarConvite).not.toHaveBeenCalled();
  });

  it("⚠️ aceitar renova a sessão — o menu de colaborador aparece sem relogar", async () => {
    const { container } = montar();

    fireEvent.click(await screen.findByText("Aceitar convite"));

    await screen.findByText("Convite aceito!");
    expect(aceitarConvite).toHaveBeenCalledWith("abc", "login");
    expect(refreshToken).toHaveBeenCalled();
    expect(estado.doAuth).toHaveBeenCalledWith({ token: "novo" });
    expect(container.querySelector("[data-erro]")).toBeNull();
  });

  it("⚠️ logado com OUTRA conta: avisa e não oferece aceitar", async () => {
    estado.email = "outra@y.com";
    const { container } = montar();

    await waitFor(() =>
      expect(container.querySelector("[data-conta-errada]")).toBeTruthy(),
    );
    expect(container.querySelector("[data-aceitar]")).toBeNull();
  });

  it("sem login e com conta: o formulário de login aparece na página", async () => {
    estado.token = "";
    const { container } = montar();

    await waitFor(() =>
      expect(container.querySelector("[data-login-form]")).toBeTruthy(),
    );
  });

  it("⚠️ sem conta: leva ao cadastro pelo convite (card 05)", async () => {
    estado.token = "";
    buscarConvitePorToken.mockResolvedValue(convite({ temConta: false }));
    const { container } = montar();

    await waitFor(() =>
      expect(container.querySelector("[data-criar-conta]")).toBeTruthy(),
    );
    expect(container.querySelector("[data-login-form]")).toBeNull();
  });

  it("convite expirado: a mensagem, sem botão", async () => {
    buscarConvitePorToken.mockResolvedValue(convite({ situacao: "expirado" }));
    const { container } = montar();

    expect(await screen.findByText(/Este convite expirou/)).toBeTruthy();
    expect(container.querySelector("[data-aceitar]")).toBeNull();
  });

  it("recusa do servidor aparece na tela", async () => {
    aceitarConvite.mockRejectedValue(new Error("Você já é colaborador deste cursinho."));
    montar();

    fireEvent.click(await screen.findByText("Aceitar convite"));

    expect(
      await screen.findByText("Você já é colaborador deste cursinho."),
    ).toBeTruthy();
  });

  it("link sem token ou inexistente: mensagem", async () => {
    montar("");

    expect(await screen.findByText("Link de convite inválido.")).toBeTruthy();
    expect(buscarConvitePorToken).not.toHaveBeenCalled();
  });
});
