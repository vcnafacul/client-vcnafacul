import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import WaitingListEdit from "./waitingListEdit";

const alunos = [
  { id: "a", position: 1, name: "Ana Souza" },
  { id: "b", position: 2, name: "Bruno Lima" },
];

const montar = () => {
  const handleClose = vi.fn();
  render(
    <WaitingListEdit
      isOpen
      handleClose={handleClose}
      inscriptionId="insc"
      students={alunos}
      updateOder={vi.fn()}
    />,
  );
  return handleClose;
};

describe("WaitingListEdit (tickets/059/01, R32)", () => {
  it("clique fora do Dialog não fecha e não descarta a reordenação", async () => {
    const handleClose = montar();
    // O Radix liga o ouvido de clique fora num setTimeout(0).
    await new Promise((r) => setTimeout(r, 10));

    fireEvent.pointerDown(document.body);
    fireEvent.mouseDown(document.body);
    fireEvent.click(document.body);

    expect(handleClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Lista de Espera" })).toBeInTheDocument();
    expect(screen.getByText("Ana Souza")).toBeInTheDocument();
  });

  it("Cancelar e o botão Fechar continuam fechando", () => {
    const handleClose = montar();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(handleClose).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
