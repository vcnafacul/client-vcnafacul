import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/prepCourse/collaborator/get-collaborator-frentes", () => ({
  getCollaboratorFrentesEnriched: vi
    .fn()
    .mockResolvedValue({ frentes: [], materias: [] }),
}));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok", permissao: {} } }),
}));
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn(), loading: vi.fn() },
}));
vi.mock("@/components/templates/modalTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

import { CollaboratorColumns } from "..";
import { ShowInfo } from "./showInfo";
import {
  consequenciasDaInativacao,
  mensagemDaAtivacao,
} from "./textosDaAtivacao";

const colaborador = (actived: boolean): CollaboratorColumns => ({
  id: "c-1",
  photo: "",
  description: "",
  actived,
  lastAccess: new Date("2026-10-01T10:00:00Z"),
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: "u-1",
  name: "Ana Lima",
  email: "ana@x.com",
  phone: "11999999999",
  role: { id: "r-prof", name: "Professor" },
});

const abrir = (actived: boolean, handleActive = vi.fn()) => {
  render(
    <ShowInfo
      isOpen
      handleClose={vi.fn()}
      collaborator={colaborador(actived)}
      handleActive={handleActive}
      handleDescription={vi.fn()}
      openUpdateRole={vi.fn()}
    />,
  );
  return { handleActive, chave: screen.getByRole("checkbox") };
};

describe("ShowInfo — ativar e inativar (tickets-documentacao, 03)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("inativar abre a confirmação com o nome e as consequências", async () => {
    const { handleActive, chave } = abrir(true);
    fireEvent.click(chave);

    expect(await screen.findByText("Inativar Ana Lima?")).toBeTruthy();
    expect(
      screen.getByText("Ao reativar, volta com a função atual (Professor)."),
    ).toBeTruthy();
    expect(handleActive).not.toHaveBeenCalled();
  });

  it("cancelar não muda nada", async () => {
    const { handleActive, chave } = abrir(true);
    fireEvent.click(chave);
    fireEvent.click(await screen.findByRole("button", { name: "Cancelar" }));

    await waitFor(() =>
      expect(screen.queryByText("Inativar Ana Lima?")).toBeNull(),
    );
    expect(handleActive).not.toHaveBeenCalled();
    expect((chave as HTMLInputElement).checked).toBe(true);
  });

  it("confirmar inativa com a intenção explícita e desliga a chave", async () => {
    const { handleActive, chave } = abrir(true, vi.fn().mockResolvedValue(true));
    fireEvent.click(chave);
    fireEvent.click(await screen.findByRole("button", { name: "Confirmar" }));

    await waitFor(() => expect(handleActive).toHaveBeenCalledWith("c-1", false));
    await waitFor(() => expect((chave as HTMLInputElement).checked).toBe(false));
  });

  it("falhou: a chave continua como estava", async () => {
    const { handleActive, chave } = abrir(
      true,
      vi.fn().mockResolvedValue(false),
    );
    fireEvent.click(chave);
    fireEvent.click(await screen.findByRole("button", { name: "Confirmar" }));

    await waitFor(() => expect(handleActive).toHaveBeenCalled());
    await waitFor(() => expect((chave as HTMLInputElement).disabled).toBe(false));
    expect((chave as HTMLInputElement).checked).toBe(true);
  });

  it("reativar vai direto, sem confirmação", async () => {
    const { handleActive, chave } = abrir(
      false,
      vi.fn().mockResolvedValue(true),
    );
    fireEvent.click(chave);

    expect(screen.queryByText(/^Inativar /)).toBeNull();
    await waitFor(() => expect(handleActive).toHaveBeenCalledWith("c-1", true));
  });

  it("a chave fica desabilitada enquanto a requisição anda", async () => {
    let terminar: (ok: boolean) => void = () => {};
    const { chave } = abrir(
      false,
      vi.fn(() => new Promise<boolean>((r) => (terminar = r))),
    );
    fireEvent.click(chave);
    await waitFor(() => expect((chave as HTMLInputElement).disabled).toBe(true));
    terminar(true);
    await waitFor(() => expect((chave as HTMLInputElement).disabled).toBe(false));
  });
});

describe("textos da ativação", () => {
  it("consequências sem função não citam o nome", () => {
    expect(consequenciasDaInativacao()).toContain(
      "Ao reativar, volta com a função atual.",
    );
  });

  it("mensagem de sucesso conforme a resposta", () => {
    expect(mensagemDaAtivacao({ actived: false })).toBe("Colaborador inativado.");
    expect(
      mensagemDaAtivacao({
        actived: true,
        funcaoRestaurada: true,
        role: { id: "r", name: "Professor" },
      }),
    ).toBe('Colaborador reativado com a função "Professor".');
    // api anterior ao card 02, ou inativado antes dele: sem função guardada
    expect(mensagemDaAtivacao({ actived: true })).toBe(
      "Colaborador reativado. Escolha a função em Editar Função.",
    );
  });
});
