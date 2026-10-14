import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getRecommendedRoles = vi.hoisted(() => vi.fn());
vi.mock("@/services/roles/getRecommended", () => ({ getRecommendedRoles }));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));
vi.mock("@/components/templates/modalTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

import { ModalExcluirColaborador } from "./ModalExcluirColaborador";

const montar = (handleExcluir = vi.fn().mockResolvedValue(true)) => {
  const handleClose = vi.fn();
  render(
    <ModalExcluirColaborador
      isOpen
      handleClose={handleClose}
      nome="Ana Lima"
      handleExcluir={handleExcluir}
    />,
  );
  return { handleExcluir, handleClose };
};

beforeEach(() => {
  getRecommendedRoles
    .mockReset()
    .mockResolvedValue([{ id: "r-rev", name: "Revisor" }]);
});

describe("ModalExcluirColaborador", () => {
  it("sem escolher perfil, exclui como aluno e fecha", async () => {
    const { handleExcluir, handleClose } = montar();
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    await waitFor(() => expect(handleClose).toHaveBeenCalled());
    expect(handleExcluir).toHaveBeenCalledWith(undefined);
  });

  it("com perfil recomendado, manda o roleId", async () => {
    const { handleExcluir } = montar();
    const select = await screen.findByRole("combobox");
    await screen.findByRole("option", { name: "Revisor" });
    fireEvent.change(select, { target: { value: "r-rev" } });
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    await waitFor(() => expect(handleExcluir).toHaveBeenCalledWith("r-rev"));
  });

  it("se a exclusão falhar, o modal continua aberto", async () => {
    const { handleClose, handleExcluir } = montar(
      vi.fn().mockResolvedValue(false),
    );
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    await waitFor(() => expect(handleExcluir).toHaveBeenCalled());
    expect(handleClose).not.toHaveBeenCalled();
  });

  it("sem a lista de recomendados, ainda exclui como aluno", async () => {
    getRecommendedRoles.mockRejectedValue(new Error("x"));
    const { handleExcluir } = montar();
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    await waitFor(() => expect(handleExcluir).toHaveBeenCalledWith(undefined));
  });
});
