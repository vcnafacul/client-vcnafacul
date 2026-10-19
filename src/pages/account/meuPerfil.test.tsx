import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** 2026-10-19 — Meu perfil com menu lateral e seções. */
const m = vi.hoisted(() => ({
  me: vi.fn(),
  upload: vi.fn(),
  push: true,
}));
vi.mock("@/store/auth", async (orig) => ({
  ...(await orig<typeof import("@/store/auth")>()),
  useAuthStore: () => ({ data: { token: "tk", permissao: {} }, updateAccount: vi.fn() }),
}));
vi.mock("../../services/auth/me", () => ({ me: m.me }));
vi.mock("../../services/auth/changeImageProfileCollaborator", () => ({
  changeImageProfileCollaborator: m.upload,
}));
vi.mock("../../services/prepCourse/collaborator/get-photo", () => ({
  getPhotoCollaborator: vi.fn().mockResolvedValue(new Blob(["x"], { type: "image/png" })),
  isLegacyPhotoKey: () => false,
}));
vi.mock("@/components/push/NotificacoesDoAparelho", () => ({
  NotificacoesDoAparelho: () => <p>bloco de notificações</p>,
}));
vi.mock("@/services/push/push", async (orig) => ({
  ...(await orig<typeof import("@/services/push/push")>()),
  pushHabilitado: () => m.push,
}));
vi.mock("./components/ModalEditFrentes", () => ({ ModalEditFrentes: () => null }));
// ⚠️ O DatePicker do MUI quebra no jsdom (locale pt-br sem firstDayOfWeek). O
// formulário não mudou; aqui só importa onde ele fica e o aviso de "não salvo".
vi.mock("@/components/organisms/accountForm", () => ({
  AccountForm: ({ onChangesChange }: { onChangesChange?: (v: boolean) => void }) => (
    <button type="button" onClick={() => onChangesChange?.(true)}>
      formulário (digitar)
    </button>
  ),
}));
vi.mock("./components/CollaboratorFrentesDisplay", () => ({
  CollaboratorFrentesDisplay: () => <p>lista de frentes</p>,
}));

import Account from ".";

const usuario = (colaborador: boolean) => ({
  id: "u1",
  firstName: "Ana",
  lastName: "Lima",
  socialName: "",
  useSocialName: false,
  email: "ana@x.com",
  phone: "11999999999",
  gender: 0,
  birthday: "2000-01-01T00:00:00.000Z",
  state: "SP",
  city: "São Paulo",
  about: "",
  collaborator: colaborador,
  collaboratorDescription: colaborador ? "Professora de Matemática" : null,
  collaboratorPhoto: colaborador ? "collaborators/a.png" : null,
  collaboratorFrentes: [],
  afinidades: [],
});

const montar = (url = "/meu-perfil") =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Account />
    </MemoryRouter>,
  );

const menuLateral = () =>
  screen.getAllByRole("tablist", { name: "Seções do perfil" }).find(
    (t) => t.getAttribute("aria-orientation") === "vertical",
  )!;

describe("Meu perfil — menu lateral", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.push = true;
    URL.createObjectURL = vi.fn(() => "blob:foto");
    URL.revokeObjectURL = vi.fn();
  });

  it("colaborador: três seções, abre em Dados pessoais com a foto e o formulário", async () => {
    m.me.mockResolvedValue(usuario(true));
    montar();
    expect(await screen.findByRole("heading", { name: "Dados pessoais" })).toBeInTheDocument();
    const itens = within(menuLateral()).getAllByRole("tab").map((t) => t.textContent);
    expect(itens).toEqual(["Dados pessoais", "Frentes de afinidade", "Notificações"]);
    expect(screen.getByText("Foto de perfil")).toBeInTheDocument();
    expect(screen.getAllByText("Professora de Matemática").length).toBeGreaterThan(0);
  });

  it("estudante: só Dados pessoais e Notificações, sem foto", async () => {
    m.me.mockResolvedValue(usuario(false));
    montar();
    await screen.findByRole("heading", { name: "Dados pessoais" });
    const itens = within(menuLateral()).getAllByRole("tab").map((t) => t.textContent);
    expect(itens).toEqual(["Dados pessoais", "Notificações"]);
    expect(screen.queryByText("Foto de perfil")).toBeNull();
  });

  it("trocar de seção mostra só ela; ?secao= abre direto", async () => {
    m.me.mockResolvedValue(usuario(true));
    montar("/meu-perfil?secao=notificacoes");
    expect(await screen.findByText("bloco de notificações")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Notificações" })).toBeVisible();
    fireEvent.click(within(menuLateral()).getByRole("tab", { name: "Frentes de afinidade" }));
    expect(screen.getByText("lista de frentes")).toBeVisible();
    expect(screen.getByText("bloco de notificações")).not.toBeVisible();
  });

  it("push desligado no ambiente: a seção explica, não fica vazia", async () => {
    m.push = false;
    m.me.mockResolvedValue(usuario(false));
    montar("/meu-perfil?secao=notificacoes");
    expect(await screen.findByText(/não estão disponíveis neste ambiente/)).toBeVisible();
  });

  it("a foto salva na hora em que é escolhida", async () => {
    m.me.mockResolvedValue(usuario(true));
    m.upload.mockResolvedValue("collaborators/nova.png");
    const { container } = montar();
    await screen.findByText("Foto de perfil");
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const arquivo = new File(["x"], "foto.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [arquivo] } });
    await waitFor(() => expect(m.upload).toHaveBeenCalledTimes(1));
    expect(m.upload.mock.calls[0][0]).toBeInstanceOf(FormData);
  });

  it("mudança não salva no formulário: ponto no item Dados pessoais, e o texto continua ao trocar de seção", async () => {
    m.me.mockResolvedValue(usuario(true));
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "formulário (digitar)" }));
    const dados = within(menuLateral()).getByRole("tab", { name: /Dados pessoais/ });
    expect(within(dados).getByLabelText("alterações não salvas")).toBeInTheDocument();
    fireEvent.click(within(menuLateral()).getByRole("tab", { name: "Notificações" }));
    // o formulário só se esconde: continua montado
    expect(screen.getByRole("button", { name: "formulário (digitar)", hidden: true })).toBeInTheDocument();
  });
});
