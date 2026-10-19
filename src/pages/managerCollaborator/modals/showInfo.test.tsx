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
import { mensagemDaAtivacao } from "./textosDaAtivacao";

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
  return { handleActive };
};

/** 2026-10-19: inativar saiu da tela; a chave só existe para ativar. */
describe("ShowInfo — só ativar", () => {
  beforeEach(() => vi.clearAllMocks());

  it("colaborador ativo: não há chave (não dá para inativar)", () => {
    abrir(true);
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.queryByText(/^Inativar /)).toBeNull();
  });

  it("inativo: a chave ativa direto e some depois", async () => {
    const { handleActive } = abrir(false, vi.fn().mockResolvedValue(true));
    fireEvent.click(screen.getByRole("checkbox"));
    await waitFor(() => expect(handleActive).toHaveBeenCalledWith("c-1", true));
    await waitFor(() => expect(screen.queryByRole("checkbox")).toBeNull());
  });

  it("falhou: a chave continua, desligada e habilitada", async () => {
    const { handleActive } = abrir(false, vi.fn().mockResolvedValue(false));
    const chave = screen.getByRole("checkbox") as HTMLInputElement;
    fireEvent.click(chave);
    await waitFor(() => expect(handleActive).toHaveBeenCalled());
    await waitFor(() => expect(chave.disabled).toBe(false));
    expect(chave.checked).toBe(false);
  });

  it("a chave fica desabilitada enquanto a requisição anda", async () => {
    let terminar: (ok: boolean) => void = () => {};
    abrir(
      false,
      vi.fn(() => new Promise<boolean>((r) => (terminar = r))),
    );
    const chave = screen.getByRole("checkbox") as HTMLInputElement;
    fireEvent.click(chave);
    await waitFor(() => expect(chave.disabled).toBe(true));
    terminar(false);
    await waitFor(() => expect(chave.disabled).toBe(false));
  });
});

describe("textos da ativação", () => {
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
