import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** 2026-10-19 — a tela de colaboradores no Dash V2. */
const m = vi.hoisted(() => ({
  permissao: {} as Record<string, boolean>,
  lista: vi.fn(),
}));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tk", permissao: m.permissao } }),
}));
vi.mock("@/services/prepCourse/collaborator/get-collaborator", () => ({
  getTodosOsColaboradores: m.lista,
}));
vi.mock("@/services/content/getMaterias", () => ({
  getMaterias: vi.fn().mockResolvedValue([]),
}));
vi.mock("@/services/prepCourse/collaborator/get-collaborator-frentes-batch", () => ({
  getCollaboratorFrentesBatch: vi.fn().mockResolvedValue({}),
}));
vi.mock("@/services/prepCourse/getRolesAtribuiveis", () => ({
  getRolesAtribuiveis: vi.fn().mockResolvedValue([]),
}));
vi.mock("@/services/prepCourse/collaborator/get-photo", () => ({
  getPhotoCollaborator: vi.fn().mockRejectedValue(new Error("sem foto")),
  isLegacyPhotoKey: () => false,
}));
vi.mock("./modals/showInfo", () => ({
  ShowInfo: ({ collaborator }: { collaborator: { name: string } }) => (
    <div role="dialog">detalhe de {collaborator.name}</div>
  ),
}));
vi.mock("./ListaDeExMembros", () => ({
  ListaDeExMembros: () => <p>lista de ex-membros</p>,
}));
vi.mock("@/components/dashV2/useAcimaDeSm", () => ({ useAcimaDeSm: () => true }));

import ManagerCollaborator from ".";

const col = (over: Record<string, unknown> = {}) => ({
  id: "c1",
  photo: "",
  description: "",
  actived: true,
  createdAt: "2026-03-05T12:00:00Z",
  updatedAt: "2026-03-05T12:00:00Z",
  user: {
    id: "u1",
    name: "Ana Lima",
    email: "ana@x.com",
    phone: "11999999999",
    lastAccess: null,
    role: { id: "r1", name: "Professor" },
  },
  ...over,
});

const montar = () =>
  render(
    <MemoryRouter>
      <ManagerCollaborator />
    </MemoryRouter>,
  );

describe("Colaboradores no Dash V2", () => {
  beforeEach(() => {
    m.permissao = {};
    m.lista.mockResolvedValue([
      col(),
      col({
        id: "c2",
        actived: false,
        createdAt: "2025-08-01T12:00:00Z",
        user: { id: "u2", name: "Bruno Souza", email: "bruno@x.com", phone: "", lastAccess: null, role: { id: "r2", name: "Monitor" } },
      }),
    ]);
  });

  it("colunas sem Status, com 'Membro desde'; a linha abre o detalhe", async () => {
    montar();
    const tabela = await screen.findByRole("table");
    const cabecalho = within(tabela).getAllByRole("columnheader").map((h) => h.textContent);
    expect(cabecalho.join("|")).toMatch(/Nome.*Email.*Função.*Telefone.*Membro desde/);
    expect(cabecalho.join("|")).not.toMatch(/Status|Criado em/);
    expect(within(tabela).getByText("05/03/2026")).toBeInTheDocument();
    // inativo continua na lista, sem rótulo de status
    expect(within(tabela).getByText("Bruno Souza")).toBeInTheDocument();
    expect(within(tabela).queryByText(/Inativo|Ativo/)).toBeNull();

    fireEvent.click(within(tabela).getByText("Ana Lima"));
    expect(await screen.findByRole("dialog")).toHaveTextContent("detalhe de Ana Lima");
  });

  it("Convites para todos; Nova/Editar Função só para o admin do cursinho", async () => {
    montar();
    await screen.findByRole("table");
    expect(screen.getByRole("button", { name: "Convites" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Nova Função" })).toBeNull();
  });

  it("admin do cursinho vê as ações de função", async () => {
    m.permissao = { gerenciarPermissoesCursinho: true };
    montar();
    await screen.findByRole("table");
    expect(screen.getByRole("button", { name: "Nova Função" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar Função" })).toBeInTheDocument();
  });

  it("busca filtra e o subtítulo mostra '1 de 2'", async () => {
    montar();
    await screen.findByRole("table");
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "bruno" } });
    await waitFor(() =>
      expect(within(screen.getByRole("table")).queryByText("Ana Lima")).toBeNull(),
    );
    expect(screen.getByText(/1 de 2/)).toBeInTheDocument();
  });

  it("aba Ex-membros", async () => {
    montar();
    await screen.findByRole("table");
    fireEvent.click(screen.getByRole("button", { name: "Ex-membros" }));
    expect(await screen.findByText("lista de ex-membros")).toBeInTheDocument();
  });
});
