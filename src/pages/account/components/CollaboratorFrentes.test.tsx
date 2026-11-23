import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CollaboratorFrentes } from "./CollaboratorFrentes";

const selectFrente = vi.hoisted(() => vi.fn());
vi.mock("../hooks/useFrentesSelection", () => ({
  useFrentesSelection: () => ({
    availableFrentes: [
      { id: "f1", nome: "Mecânica", materia: "m1" },
      { id: "f2", nome: "Genética", materia: "m2" },
    ],
    selectedFrentes: [],
    isLoading: false,
    selectFrente,
    removeFrente: vi.fn(),
  }),
}));
vi.mock("@/services/content/getMaterias", () => ({
  getMaterias: () =>
    Promise.resolve([
      { _id: "m1", nome: "Física" },
      { _id: "m2", nome: "Biologia" },
    ]),
}));

describe("CollaboratorFrentes", () => {
  it("sem resultado, o aviso repete o termo buscado", async () => {
    render(<CollaboratorFrentes token="t" />);
    fireEvent.click(screen.getByRole("combobox", { name: "Frentes de Afinidade" }));
    fireEvent.change((await screen.findAllByPlaceholderText(/Buscar por nome/)).find((e) => e.tagName === "INPUT")!, {
      target: { value: "zzz" },
    });
    expect(await screen.findByText('Nenhuma frente encontrada com "zzz"')).toBeInTheDocument();
  });

  it("escolhe uma frente pelo Combobox, sem camadas transparentes soltas", async () => {
    const { container } = render(<CollaboratorFrentes token="t" />);
    const campo = screen.getByRole("combobox", { name: "Frentes de Afinidade" });
    fireEvent.click(campo);
    fireEvent.click(await screen.findByText(/Genética · Biologia/));
    expect(selectFrente).toHaveBeenCalledWith("f2");
    expect(container.querySelector(".fixed.inset-0")).toBeNull();
  });
});
