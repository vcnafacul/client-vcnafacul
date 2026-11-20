import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Field, FormLegend } from "./field";
import { Input } from "./input";
import { Textarea } from "./textarea";

describe("Field", () => {
  it("liga o rótulo ao controle", () => {
    render(
      <Field label="Nome">
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText("Nome")).toBeTruthy();
  });

  it("com error, o controle fica inválido e aponta para a mensagem", () => {
    render(
      <Field label="Ano" error="Ano deve ter 4 dígitos." hint="dica">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText("Ano");
    expect(input).toHaveAttribute("aria-invalid", "true");
    const mensagem = screen.getByText("Ano deve ter 4 dígitos.");
    expect(input.getAttribute("aria-describedby")).toContain(mensagem.id);
    expect(screen.queryByText("dica")).toBeNull();
  });

  it("com hint, descreve o controle", () => {
    render(
      <Field label="Nome" hint="Aparece na lista.">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText("Nome");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input.getAttribute("aria-describedby")).toBe(screen.getByText("Aparece na lista.").id);
  });

  it("com required, há um * aria-hidden e o controle é obrigatório", () => {
    const { container } = render(
      <Field label="Nome" required>
        <Input />
      </Field>,
    );
    const asterisco = container.querySelector('[aria-hidden="true"]');
    expect(asterisco?.textContent).toBe("*");
    const input = screen.getByRole("textbox");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("aria-required", "true");
  });

  it("com maxLength, mostra o contador depois de digitar", () => {
    render(
      <Field label="Observações" maxLength={500}>
        <Textarea />
      </Field>,
    );
    expect(screen.getByText("0/500")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Observações"), { target: { value: "abc" } });
    expect(screen.getByText("3/500")).toBeTruthy();
    expect(screen.getByLabelText("Observações")).toHaveAttribute("maxlength", "500");
  });
});

describe("FormLegend", () => {
  it("mostra '* obrigatório'", () => {
    render(<FormLegend />);
    expect(screen.getByText("* obrigatório")).toBeTruthy();
  });
});
