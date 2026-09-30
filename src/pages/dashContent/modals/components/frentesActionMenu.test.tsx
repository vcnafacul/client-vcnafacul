import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const permissao = vi.hoisted(() => ({ valor: {} as Record<string, boolean> }));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { permissao: permissao.valor } }),
}));

import { FrentesActionMenu } from "./frentesActionMenu";

describe("FrentesActionMenu", () => {
  it("⚠️ sem a permissão, nem o '+' aparece (antes aparecia para todos)", () => {
    permissao.valor = {};
    render(
      <FrentesActionMenu
        onAdd={vi.fn()}
        addLabel="Adicionar Tema"
        onEdit={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText("Adicionar Tema")).toBeNull();
    expect(screen.queryByLabelText("Editar")).toBeNull();
  });

  it("tema: excluir pede confirmação antes", () => {
    permissao.valor = { gerenciadorDemanda: true };
    const onDelete = vi.fn();
    render(
      <FrentesActionMenu
        onDelete={onDelete}
        menuType="tema"
        confirmarExclusao="Excluir o tema Funções?"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByText("Excluir o tema Funções?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(onDelete).toHaveBeenCalled();
  });
});
