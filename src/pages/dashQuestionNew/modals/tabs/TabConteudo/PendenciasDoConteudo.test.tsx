import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FaixaDoConteudo } from "./PendenciasDoConteudo";
import type { Pendencia } from "./pendencias";

const pendencia: Pendencia = {
  campo: "textoAlternativaA",
  rotulo: "Alternativa A",
  aba: "alternativas",
  mensagem: "A alternativa A é obrigatória",
};

const montar = (over: Partial<Parameters<typeof FaixaDoConteudo>[0]> = {}) => {
  const props = {
    pendencias: [] as Pendencia[],
    onIrPara: vi.fn(),
    isDirty: false,
    isSaving: false,
    onSave: vi.fn(),
    ...over,
  };
  render(<FaixaDoConteudo {...props} />);
  return props;
};

const salvar = () =>
  screen.queryByRole("button", { name: /Salvar enunciado e alternativas/ });

describe("FaixaDoConteudo", () => {
  it("sem problemas e sem alteração: não aparece", () => {
    montar();
    expect(salvar()).toBeNull();
  });

  it("com problema: lista com 'Ir até o campo' e o Salvar travado", () => {
    const { onIrPara } = montar({ pendencias: [pendencia], isDirty: true });
    expect(screen.getByText(/A alternativa A é obrigatória/)).toBeInTheDocument();
    expect(salvar()).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Ir até o campo" }));
    expect(onIrPara).toHaveBeenCalledWith(pendencia);
  });

  it("sem problema e com alteração: avisa e deixa salvar dali", () => {
    const { onSave } = montar({ isDirty: true });
    expect(screen.getByText(/alterações não salvas/)).toBeInTheDocument();
    fireEvent.click(salvar()!);
    expect(onSave).toHaveBeenCalled();
  });
});
