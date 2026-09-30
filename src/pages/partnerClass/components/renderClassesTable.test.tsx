import { ClassEntity } from "@/types/partnerPrepCourse/classEntity";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

const permissao = vi.hoisted(() => ({ valor: {} as Record<string, boolean> }));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "t", permissao: permissao.valor } }),
}));

import { RenderClassesTable } from "./renderClassesTable";

const turma = (id: string, alunos: number) =>
  ({
    id,
    name: `Turma ${id}`,
    description: "",
    number_students: alunos,
  }) as unknown as ClassEntity;

const montar = (podeGerenciar: boolean) =>
  render(
    <MemoryRouter>
      <RenderClassesTable
        classes={[turma("vazia", 0), turma("cheia", 5)]}
        onDeleteClass={vi.fn()}
        handleEditClass={vi.fn()}
        podeGerenciar={podeGerenciar}
      />
    </MemoryRouter>,
  );

const linha = (nome: string) =>
  within(screen.getByText(nome).closest("tr") as HTMLElement);

describe("RenderClassesTable — quem pode editar e excluir", () => {
  it("com gerenciarTurmas: edita as duas; exclui só a turma sem alunos", () => {
    permissao.valor = { gerenciarTurmas: true };
    montar(true);
    expect(
      linha("Turma vazia").getByRole("button", { name: "Excluir" }),
    ).toBeInTheDocument();
    expect(
      linha("Turma cheia").queryByRole("button", { name: "Excluir" }),
    ).toBeNull();
    expect(screen.getAllByLabelText("Editar")).toHaveLength(2);
  });

  it("⚠️ só visualizarTurmas: nem editar nem excluir (antes via excluir e levava 403)", () => {
    permissao.valor = { visualizarTurmas: true };
    montar(false);
    expect(screen.queryByRole("button", { name: "Excluir" })).toBeNull();
    expect(screen.queryByLabelText("Editar")).toBeNull();
    // ver a turma continua
    expect(screen.getAllByLabelText("Visualizar")).toHaveLength(2);
  });
});
