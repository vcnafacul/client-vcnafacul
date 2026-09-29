import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const svc = vi.hoisted(() => ({ duplicarProvaCursinho: vi.fn() }));
vi.mock("@/services/prova/duplicarProvaCursinho", () => svc);
const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
vi.mock("react-toastify", () => ({ toast }));
vi.mock("@/components/templates/modalTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { ModalDuplicarProva } from "./ModalDuplicarProva";

const PROVA = { _id: "p1", nome: "Simulado Inglês" } as never;

const abrir = (onDuplicada = vi.fn()) => {
  render(
    <ModalDuplicarProva
      prova={PROVA}
      token="tk"
      isOpen
      handleClose={vi.fn()}
      onDuplicada={onDuplicada}
    />,
  );
  return onDuplicada;
};

describe("Duplicar prova (027 · 03)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sugere '<nome> (cópia)' e avisa que as questões são as mesmas", () => {
    abrir();
    expect(screen.getByLabelText("Nome da nova prova")).toHaveValue("Simulado Inglês (cópia)");
    expect(screen.getByRole("note")).toHaveTextContent("as mesmas");
    expect(screen.getByRole("note")).toHaveTextContent("A ordem é de cada prova");
  });

  it("duplica com o nome escolhido e entrega a prova nova", async () => {
    const nova = { _id: "p2", nome: "Simulado Espanhol" };
    svc.duplicarProvaCursinho.mockResolvedValue(nova);
    const onDuplicada = abrir();
    fireEvent.change(screen.getByLabelText("Nome da nova prova"), {
      target: { value: "  Simulado Espanhol " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Duplicar" }));
    await waitFor(() => expect(onDuplicada).toHaveBeenCalledWith(nova));
    expect(svc.duplicarProvaCursinho).toHaveBeenCalledWith("p1", "Simulado Espanhol", "tk");
    expect(toast.success).toHaveBeenCalledWith("Prova duplicada: Simulado Espanhol");
  });

  it("409 vira toast e o modal fica", async () => {
    svc.duplicarProvaCursinho.mockRejectedValue(new Error("Já existe uma prova com esse nome"));
    const onDuplicada = abrir();
    fireEvent.click(screen.getByRole("button", { name: "Duplicar" }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Já existe uma prova com esse nome"),
    );
    expect(onDuplicada).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Nome da nova prova")).toBeInTheDocument();
  });

  it("nome vazio não chama a api", () => {
    abrir();
    fireEvent.change(screen.getByLabelText("Nome da nova prova"), { target: { value: "  " } });
    fireEvent.click(screen.getByRole("button", { name: "Duplicar" }));
    expect(svc.duplicarProvaCursinho).not.toHaveBeenCalled();
  });
});
