import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { useForm } from "react-hook-form";

import { CampoDoFormulario } from "./campo-do-formulario";
import { GrupoDeCheckbox } from "./grupo-de-checkbox";
import { SelectOpcoes } from "./select-opcoes";
import { SenhaInput } from "./senha-input";
import { Field } from "../ui/field";

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

describe("SelectOpcoes", () => {
  const opcoes = [
    { value: 1, label: "Um" },
    { value: 2, label: "Dois" },
  ];

  it("devolve o valor com o tipo original (número continua número)", () => {
    const onValueChange = vi.fn();
    render(
      <Field label="Número">
        <SelectOpcoes options={opcoes} onValueChange={onValueChange} />
      </Field>,
    );
    abrir("Número");
    fireEvent.click(screen.getByRole("option", { name: "Dois" }));
    expect(onValueChange).toHaveBeenCalledWith(2);
  });

  it("mostra a opção escolhida e o placeholder sem valor", () => {
    const { rerender } = render(
      <Field label="Número">
        <SelectOpcoes options={opcoes} onValueChange={vi.fn()} />
      </Field>,
    );
    expect(screen.getByRole("combobox", { name: "Número" })).toHaveTextContent(
      "Selecione",
    );
    rerender(
      <Field label="Número">
        <SelectOpcoes options={opcoes} value={1} onValueChange={vi.fn()} />
      </Field>,
    );
    expect(screen.getByRole("combobox", { name: "Número" })).toHaveTextContent(
      "Um",
    );
  });

  it("lista longa vira Combobox com busca", () => {
    const longa = Array.from({ length: 12 }, (_, i) => ({
      value: `v${i}`,
      label: `Opção ${i}`,
    }));
    const onValueChange = vi.fn();
    render(
      <Field label="Estado">
        <SelectOpcoes options={longa} onValueChange={onValueChange} />
      </Field>,
    );
    fireEvent.click(screen.getByRole("combobox", { name: "Estado" }));
    expect(screen.getByPlaceholderText("Buscar…")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Opção 3"));
    expect(onValueChange).toHaveBeenCalledWith("v3");
  });
});

describe("GrupoDeCheckbox", () => {
  it("marca e desmarca devolvendo a lista", () => {
    const onValueChange = vi.fn();
    render(<GrupoDeCheckbox opcoes={["A", "B"]} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "A" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "B" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["A", "B"]);
    fireEvent.click(screen.getByRole("checkbox", { name: "A" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["B"]);
  });

  it("opção 'Não possuo' é excludente: limpa as outras e trava", () => {
    const onValueChange = vi.fn();
    render(
      <GrupoDeCheckbox
        opcoes={["Bolsa", "Não possuo bolsa"]}
        excludentes
        defaultValue={["Bolsa"]}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Não possuo bolsa" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["Não possuo bolsa"]);
    expect(screen.getByRole("checkbox", { name: "Bolsa" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Bolsa" })).not.toBeChecked();
  });
});

describe("SenhaInput", () => {
  it("mostra e oculta a senha por um botão com nome acessível", () => {
    render(
      <Field label="Senha">
        <SenhaInput />
      </Field>,
    );
    const campo = screen.getByLabelText("Senha");
    expect(campo).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(campo).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: "Ocultar senha" }),
    ).toBeInTheDocument();
  });
});

describe("CampoDoFormulario com react-hook-form", () => {
  function Formulario({
    aoEnviar,
    aoMontar,
  }: {
    aoEnviar: (d: unknown) => void;
    aoMontar?: (setValue: (n: string, v: string) => void) => void;
  }) {
    const { register, handleSubmit, setValue } = useForm();
    aoMontar?.(setValue as never);
    return (
      <form onSubmit={handleSubmit(aoEnviar)} noValidate>
        <CampoDoFormulario
          register={register}
          id="nome"
          label="Nome"
          required
          error={{ type: "required", message: "Informe o nome" }}
        />
        <CampoDoFormulario
          register={register}
          id="estado"
          label="Estado"
          type="option"
          options={[
            { value: "SP", label: "São Paulo" },
            { value: "RJ", label: "Rio de Janeiro" },
          ]}
        />
        <CampoDoFormulario
          register={register}
          id="phone"
          label="Telefone"
        />
        <button type="submit">enviar</button>
      </form>
    );
  }

  it("rótulo ligado ao campo, obrigatório, erro embaixo e teclado certo", () => {
    render(<Formulario aoEnviar={vi.fn()} />);
    const nome = screen.getByRole("textbox", { name: "Nome" });
    expect(nome).toBeRequired();
    expect(nome).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Informe o nome")).toBeInTheDocument();
    expect(screen.getByLabelText("Telefone")).toHaveAttribute("inputmode", "tel");
  });

  it("envia texto digitado e a escolha do Select (a primeira opção por padrão)", async () => {
    const aoEnviar = vi.fn();
    render(<Formulario aoEnviar={aoEnviar} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Nome" }), { target: { value: "Ana" } });
    fireEvent.click(screen.getByText("enviar"));
    await waitFor(() => expect(aoEnviar).toHaveBeenCalled());
    expect(aoEnviar.mock.calls[0][0]).toMatchObject({ nome: "Ana", estado: "SP" });

    abrir("Estado");
    fireEvent.click(screen.getByRole("option", { name: "Rio de Janeiro" }));
    fireEvent.click(screen.getByText("enviar"));
    await waitFor(() => expect(aoEnviar).toHaveBeenCalledTimes(2));
    expect(aoEnviar.mock.calls[1][0]).toMatchObject({ estado: "RJ" });
  });

  it("setValue de fora muda o que o Select mostra", async () => {
    let setValue!: (n: string, v: string) => void;
    render(
      <Formulario aoEnviar={vi.fn()} aoMontar={(fn) => (setValue = fn)} />,
    );
    expect(screen.getByRole("combobox", { name: "Estado" })).toHaveTextContent(
      "São Paulo",
    );
    setValue("estado", "RJ");
    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: "Estado" })).toHaveTextContent(
        "Rio de Janeiro",
      ),
    );
  });
});
