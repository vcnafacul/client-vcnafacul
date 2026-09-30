import { StatusEnum } from "@/enums/generic/statusEnum";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OrderEditContent from "./orderEditContent";

vi.mock("react-toastify", () => ({
  toast: {
    loading: vi.fn(),
    update: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const itens = [
  { id: "a", title: "Aula A", status: StatusEnum.Approved },
  { id: "b", title: "Aula B", status: StatusEnum.Approved },
];

const montar = () => {
  const handleClose = vi.fn();
  const updateOrder = vi.fn(async () => undefined);
  const aoSalvar = vi.fn();
  render(
    <OrderEditContent
      isOpen
      handleClose={handleClose}
      contents={itens}
      updateOrder={updateOrder}
      aoSalvar={aoSalvar}
    />,
  );
  return { handleClose, updateOrder, aoSalvar };
};

describe("OrderEditContent", () => {
  it("↓ reordena e salvar manda a nova ordem e avisa quem abriu", async () => {
    const { updateOrder, aoSalvar } = montar();
    fireEvent.click(
      screen.getAllByRole("button", { name: "Mover para baixo" })[0],
    );
    fireEvent.click(screen.getByText("Salvar"));
    await waitFor(() =>
      expect(updateOrder).toHaveBeenCalledWith({ orderedIds: ["b", "a"] }),
    );
    await waitFor(() =>
      expect(
        aoSalvar.mock.calls[0][0].map((i: { id: string }) => i.id),
      ).toEqual(["b", "a"]),
    );
  });

  it("⚠️ cancelar com a ordem mexida pergunta antes de descartar", () => {
    const confirmar = vi.spyOn(window, "confirm").mockReturnValue(false);
    const { handleClose } = montar();
    fireEvent.click(
      screen.getAllByRole("button", { name: "Mover para baixo" })[0],
    );
    fireEvent.click(screen.getByText("Cancelar"));
    expect(confirmar).toHaveBeenCalled();
    expect(handleClose).not.toHaveBeenCalled();
    confirmar.mockRestore();
  });

  it("cancelar sem mexer fecha direto", () => {
    const { handleClose } = montar();
    fireEvent.click(screen.getByText("Cancelar"));
    expect(handleClose).toHaveBeenCalled();
  });
});
