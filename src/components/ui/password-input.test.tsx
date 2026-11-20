import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Field } from "./field";
import { PasswordInput } from "./password-input";

describe("PasswordInput", () => {
  it("mostra e oculta a senha por um botão com nome acessível", () => {
    render(
      <Field label="Senha">
        <PasswordInput autoComplete="current-password" />
      </Field>,
    );
    const campo = screen.getByLabelText("Senha");
    expect(campo).toHaveAttribute("type", "password");
    expect(campo).toHaveAttribute("autocomplete", "current-password");
    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(campo).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ocultar senha" })).toBeInTheDocument();
  });
});
