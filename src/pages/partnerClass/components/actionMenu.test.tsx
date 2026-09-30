import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ActionMenu } from "./actionMenu";

describe("ActionMenu — excluir", () => {
  it("só exclui depois de confirmar", () => {
    const onDelete = vi.fn();
    render(
      <ActionMenu onDelete={onDelete} mensagemExclusao="Excluir a turma A?" />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByText("Excluir a turma A?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("cancelar não exclui", () => {
    const onDelete = vi.fn();
    render(<ActionMenu onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onDelete).not.toHaveBeenCalled();
  });
});
