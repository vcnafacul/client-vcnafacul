import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { Field } from "./field";
import { OptionsSelect } from "./options-select";

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.scrollIntoView ??= () => {};
});

const abrir = (rotulo: string) =>
  fireEvent.keyDown(screen.getByRole("combobox", { name: rotulo }), {
    key: "Enter",
  });

describe("OptionsSelect", () => {
  const opcoes = [
    { value: 1, label: "Um" },
    { value: 2, label: "Dois" },
  ];

  it("devolve o valor com o tipo original (número continua número)", () => {
    const onValueChange = vi.fn();
    render(
      <Field label="Número">
        <OptionsSelect options={opcoes} onValueChange={onValueChange} />
      </Field>,
    );
    abrir("Número");
    fireEvent.click(screen.getByRole("option", { name: "Dois" }));
    expect(onValueChange).toHaveBeenCalledWith(2);
  });

  it("mostra a opção escolhida e o placeholder sem valor", () => {
    const { rerender } = render(
      <Field label="Número">
        <OptionsSelect options={opcoes} onValueChange={vi.fn()} />
      </Field>,
    );
    expect(screen.getByRole("combobox", { name: "Número" })).toHaveTextContent("Selecione");
    rerender(
      <Field label="Número">
        <OptionsSelect options={opcoes} value={1} onValueChange={vi.fn()} />
      </Field>,
    );
    expect(screen.getByRole("combobox", { name: "Número" })).toHaveTextContent("Um");
  });

  it("obrigatório vai como aria-required no gatilho, não como `required` de botão", () => {
    render(
      <Field label="Número" required>
        <OptionsSelect options={opcoes} onValueChange={vi.fn()} />
      </Field>,
    );
    const gatilho = screen.getByRole("combobox", { name: "Número" });
    expect(gatilho).toHaveAttribute("aria-required", "true");
    expect(gatilho).not.toHaveAttribute("required");
  });

  it("lista longa vira Combobox com busca", () => {
    const longa = Array.from({ length: 12 }, (_, i) => ({
      value: `v${i}`,
      label: `Opção ${i}`,
    }));
    const onValueChange = vi.fn();
    render(
      <Field label="Estado">
        <OptionsSelect options={longa} onValueChange={onValueChange} />
      </Field>,
    );
    fireEvent.click(screen.getByRole("combobox", { name: "Estado" }));
    expect(screen.getByPlaceholderText("Buscar…")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Opção 3"));
    expect(onValueChange).toHaveBeenCalledWith("v3");
  });

  it("sem opções, o Select mostra o emptyText no lugar da lista", () => {
    render(
      <Field label="Questão">
        <OptionsSelect options={[]} emptyText="Nenhuma questão ativa disponível" onValueChange={vi.fn()} />
      </Field>,
    );
    abrir("Questão");
    expect(screen.getByText("Nenhuma questão ativa disponível")).toBeInTheDocument();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("acima de 10 opções, o emptyText chega ao Combobox (em função da busca)", () => {
    const muitas = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Item ${i + 1}` }));
    render(
      <Field label="Muitos">
        <OptionsSelect options={muitas} emptyText={(b) => `Nada com "${b}"`} onValueChange={vi.fn()} />
      </Field>,
    );
    fireEvent.click(screen.getByRole("combobox", { name: "Muitos" }));
    fireEvent.change(screen.getByPlaceholderText("Buscar…"), { target: { value: "zzz" } });
    expect(screen.getByText('Nada com "zzz"')).toBeInTheDocument();
  });
});
