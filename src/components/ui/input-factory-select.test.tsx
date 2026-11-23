import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InputFactory } from "@/components/organisms/inputFactory";

describe("InputFactory select", () => {
  it("sem valor mostra o placeholder, sem escolher a primeira opção", () => {
    render(
      <InputFactory
        type="select"
        id="cor"
        label="Cor"
        placeholder="Escolha a cor"
        options={[
          { value: "a", label: "Azul" },
          { value: "b", label: "Branco" },
        ]}
      />,
    );
    expect(screen.getByRole("combobox").textContent).toContain("Escolha a cor");
  });

  it("com valor mostra o rótulo da opção", () => {
    render(
      <InputFactory
        type="select"
        id="cor"
        label="Cor"
        value="b"
        options={[
          { value: "a", label: "Azul" },
          { value: "b", label: "Branco" },
        ]}
      />,
    );
    expect(screen.getByRole("combobox").textContent).toContain("Branco");
  });
});
