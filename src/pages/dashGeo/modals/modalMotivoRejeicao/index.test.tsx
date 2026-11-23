import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ModalMotivoRejeicao } from ".";
import { MotivoRejeicaoGeo } from "./motivos";

const montar = () => {
  const onConfirm = vi.fn();
  render(
    <ModalMotivoRejeicao isOpen handleClose={vi.fn()} onConfirm={onConfirm} />,
  );
  const confirmar = () => screen.getByRole("button", { name: "Rejeitar cadastro" });
  return { onConfirm, confirmar };
};

describe("ModalMotivoRejeicao", () => {
  it("lista os 4 motivos e só confirma depois de escolher um", () => {
    const { confirmar } = montar();
    expect(screen.getAllByRole("radio")).toHaveLength(4);
    expect(confirmar()).toBeDisabled();
    fireEvent.click(screen.getByLabelText("Não é um cursinho popular"));
    expect(confirmar()).toBeEnabled();
  });

  it("motivo fixo: complemento opcional, sem espaços nas pontas", () => {
    const { onConfirm, confirmar } = montar();
    fireEvent.click(screen.getByLabelText("Cursinho já cadastrado"));
    fireEvent.click(confirmar());
    expect(onConfirm).toHaveBeenLastCalledWith(
      MotivoRejeicaoGeo.JaCadastrado,
      undefined,
    );

    fireEvent.change(screen.getByLabelText(/Complemento/), {
      target: { value: "  igual ao Cursinho X " },
    });
    fireEvent.click(confirmar());
    expect(onConfirm).toHaveBeenLastCalledWith(
      MotivoRejeicaoGeo.JaCadastrado,
      "igual ao Cursinho X",
    );
  });

  it("clique fora não fecha (R32)", async () => {
    const handleClose = vi.fn();
    render(<ModalMotivoRejeicao isOpen handleClose={handleClose} onConfirm={vi.fn()} />);
    // O Radix liga o ouvinte de clique fora num timeout.
    await new Promise((r) => setTimeout(r, 20));
    fireEvent.pointerDown(document.body);
    fireEvent.click(document.body);
    expect(handleClose).not.toHaveBeenCalled();
  });

  it("'Outro' exige o texto", () => {
    const { onConfirm, confirmar } = montar();
    fireEvent.click(screen.getByLabelText("Outro"));
    const texto = screen.getByLabelText(/Descreva o motivo/);
    fireEvent.change(texto, { target: { value: "   " } });
    expect(confirmar()).toBeDisabled();
    fireEvent.change(texto, { target: { value: "Escola particular" } });
    fireEvent.click(confirmar());
    expect(onConfirm).toHaveBeenCalledWith(
      MotivoRejeicaoGeo.Outro,
      "Escola particular",
    );
  });
});
