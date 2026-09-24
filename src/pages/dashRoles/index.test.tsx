import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashRoles from ".";

const getUsersRole = vi.hoisted(() => vi.fn());
vi.mock("../../services/roles/getUsersRole", () => ({ getUsersRole }));
vi.mock("../../services/roles/getRoles", () => ({
  getRoles: vi.fn().mockResolvedValue({
    data: [
      { id: "r1", name: "aluno" },
      { id: "r2", name: "professor" },
    ],
  }),
}));
const updateUserRole = vi.hoisted(() => vi.fn());
vi.mock("../../services/roles/updateUserRole", () => ({ updateUserRole }));
vi.mock("../../services/roles/getResumoDoUsuario", () => ({
  getResumoDoUsuario: vi.fn().mockResolvedValue({
    conta: { id: "u1", nome: "Maria da Silva", email: "resumo@x.com", funcao: null },
    colaborador: null,
    estudante: { atual: [], historico: [] },
  }),
}));
vi.mock("../../store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
// A troca de função não interessa aqui — só se abre, e salva "r2".
vi.mock("./modals/ModalRole", () => ({
  default: ({
    isOpen,
    updateUserRole,
  }: {
    isOpen: boolean;
    updateUserRole: (id: string) => void;
  }) =>
    isOpen ? (
      <div data-modal-role>
        <button onClick={() => updateUserRole("r2")}>salvar-r2</button>
      </div>
    ) : null,
}));

const usuario = (id: string, over: Record<string, unknown> = {}) => ({
  user: {
    id,
    firstName: "Maria",
    lastName: "da Silva",
    email: `${id}@x.com`,
    phone: "",
    createdAt: "2026-01-10T12:00:00Z",
    lastAccess: "2026-09-20T12:00:00Z",
    useSocialName: false,
    ...over,
  },
  roleId: "r1",
  roleName: "aluno",
});

const campo = () =>
  document.querySelector("input[type='search']") as HTMLInputElement;

describe("DashRoles no DashListTemplate (usuários 03)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUsersRole.mockResolvedValue({ data: [usuario("u1")], totalItems: 1 });
  });

  it("⚠️ não traz nada de início — e o vazio convida a buscar", async () => {
    render(<DashRoles />);

    expect(
      await screen.findByText("Busque por nome, sobrenome ou email."),
    ).toBeTruthy();
    expect(getUsersRole).not.toHaveBeenCalled();
  });

  it("⚠️ Enter busca com o texto do campo, com o teto de 1000", async () => {
    render(<DashRoles />);

    fireEvent.change(campo(), { target: { value: "Maria Silva" } });
    fireEvent.keyDown(campo(), { key: "Enter" });

    await waitFor(() =>
      expect(getUsersRole).toHaveBeenCalledWith("tok", 1, 1000, "Maria Silva", ""),
    );
    expect(await screen.findByText("u1@x.com")).toBeTruthy();
  });

  it("mostra o nome social quando a pessoa pediu", async () => {
    getUsersRole.mockResolvedValue({
      data: [usuario("u2", { firstName: "Carlos", socialName: "Carla", useSocialName: true, lastName: "Souza" })],
      totalItems: 1,
    });
    render(<DashRoles />);

    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(await screen.findByText("Carla Souza")).toBeTruthy();
  });

  it("depois de uma busca sem resultado, diz que não achou", async () => {
    getUsersRole.mockResolvedValue({ data: [], totalItems: 0 });
    render(<DashRoles />);

    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(
      await screen.findByText("Nenhum usuário encontrado para esta busca."),
    ).toBeTruthy();
  });

  it("⚠️ passou do teto: avisa, em vez de cortar calado", async () => {
    getUsersRole.mockResolvedValue({ data: [usuario("u1")], totalItems: 1500 });
    const { container } = render(<DashRoles />);

    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    await waitFor(() =>
      expect(container.querySelector("[data-aviso-limite]")?.textContent).toMatch(
        /Mostrando 1 de 1500/,
      ),
    );
  });

  it("as ações de antes continuam", () => {
    render(<DashRoles />);

    for (const acao of ["Buscar", "Nova Função", "Editar Funções", "Enviar Email"]) {
      expect(screen.getByRole("button", { name: acao })).toBeTruthy();
    }
  });

  it("⚠️ clicar no usuário abre o modal do usuário, não a troca de função (card 05)", async () => {
    const { container } = render(<DashRoles />);
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    fireEvent.click(await screen.findByText("u1@x.com"));

    expect(await screen.findByText("resumo@x.com")).toBeTruthy();
    expect(container.querySelector("[data-modal-role]")).toBeNull();
  });

  it("⚠️ 'Alterar função' abre a troca; ao salvar, a seção muda e o modal fica", async () => {
    updateUserRole.mockResolvedValue(undefined);
    const { container } = render(<DashRoles />);
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
    fireEvent.click(await screen.findByText("u1@x.com"));
    await screen.findByText("resumo@x.com");

    fireEvent.click(screen.getByRole("button", { name: "Alterar função" }));
    fireEvent.click(await screen.findByText("salvar-r2"));

    await waitFor(() =>
      expect(container.querySelector("[data-modal-role]")).toBeNull(),
    );
    expect(updateUserRole).toHaveBeenCalledWith("u1", "r2", "tok");
    expect(
      container.querySelector("[data-secao='funcao']")?.textContent,
    ).toMatch(/professor/);
    expect(screen.getByText("resumo@x.com")).toBeTruthy();
  });
});
