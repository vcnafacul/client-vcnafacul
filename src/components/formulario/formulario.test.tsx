import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { useForm, type FieldValues, type Resolver } from "react-hook-form";

import { CampoDoFormulario } from "./campo-do-formulario";

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.scrollIntoView ??= () => {};
});

const gatilho = () => screen.getByRole("combobox", { name: "Estado" });
const abrir = () => fireEvent.keyDown(gatilho(), { key: "Enter" });

type Api = {
  setValue: (n: string, v: string) => void;
  reset: (v?: FieldValues) => void;
};

function Formulario({
  aoEnviar,
  api,
  resolver,
}: {
  aoEnviar: (d: unknown) => void;
  api?: Api;
  resolver?: Resolver;
}) {
  const { control, handleSubmit, setValue, reset } = useForm({ resolver });
  if (api) {
    api.setValue = setValue as never;
    api.reset = reset;
  }
  return (
    <form onSubmit={handleSubmit(aoEnviar)} noValidate>
      <CampoDoFormulario
        control={control}
        id="nome"
        label="Nome"
        required
        autoComplete="name"
      />
      <CampoDoFormulario
        control={control}
        id="state"
        label="Estado"
        type="select"
        options={[
          { value: "SP", label: "São Paulo" },
          { value: "RJ", label: "Rio de Janeiro" },
        ]}
      />
      <CampoDoFormulario
        control={control}
        id="phone"
        label="Telefone"
        inputMode="tel"
        autoComplete="tel"
      />
      <button type="submit">enviar</button>
    </form>
  );
}

const enviar = async (aoEnviar: ReturnType<typeof vi.fn>, n: number) => {
  fireEvent.click(screen.getByText("enviar"));
  await waitFor(() => expect(aoEnviar).toHaveBeenCalledTimes(n));
  return aoEnviar.mock.calls[n - 1][0];
};

describe("CampoDoFormulario com react-hook-form", () => {
  it("rótulo ligado ao campo, obrigatório e atributos declarados no dado", () => {
    render(<Formulario aoEnviar={vi.fn()} />);
    const nome = screen.getByRole("textbox", { name: "Nome" });
    expect(nome).toBeRequired();
    expect(nome).toHaveAttribute("autocomplete", "name");
    const tel = screen.getByLabelText("Telefone");
    expect(tel).toHaveAttribute("inputmode", "tel");
    expect(tel).toHaveAttribute("autocomplete", "tel");
  });

  it("não deduz atributos do id: sem declarar, não há inputmode", () => {
    render(<Formulario aoEnviar={vi.fn()} />);
    expect(screen.getByRole("textbox", { name: "Nome" })).not.toHaveAttribute("inputmode");
  });

  it("envia o texto digitado e a escolha do Select (a primeira opção por padrão)", async () => {
    const aoEnviar = vi.fn();
    render(<Formulario aoEnviar={aoEnviar} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Nome" }), {
      target: { value: "Ana" },
    });
    expect(await enviar(aoEnviar, 1)).toMatchObject({ nome: "Ana", state: "SP" });

    abrir();
    fireEvent.click(screen.getByRole("option", { name: "Rio de Janeiro" }));
    expect(await enviar(aoEnviar, 2)).toMatchObject({ state: "RJ" });
  });

  it("depois de reset({ state: 'SP' }), o Select mostra São Paulo e o envio leva SP", async () => {
    const aoEnviar = vi.fn();
    const api = {} as Api;
    render(<Formulario aoEnviar={aoEnviar} api={api} />);
    abrir();
    fireEvent.click(screen.getByRole("option", { name: "Rio de Janeiro" }));
    expect(gatilho()).toHaveTextContent("Rio de Janeiro");

    act(() => api.reset({ nome: "", state: "SP", phone: "" }));
    await waitFor(() => expect(gatilho()).toHaveTextContent("São Paulo"));
    expect(await enviar(aoEnviar, 1)).toMatchObject({ state: "SP" });
  });

  it("depois do reset, setValue('state','RJ') muda a tela e o envio bate com ela", async () => {
    const aoEnviar = vi.fn();
    const api = {} as Api;
    render(<Formulario aoEnviar={aoEnviar} api={api} />);
    act(() => api.reset({ nome: "", state: "SP", phone: "" }));
    act(() => api.setValue("state", "RJ"));
    await waitFor(() => expect(gatilho()).toHaveTextContent("Rio de Janeiro"));
    expect(await enviar(aoEnviar, 1)).toMatchObject({ state: "RJ" });
  });

  it("erro de validação no Select leva o foco ao gatilho", async () => {
    const resolver: Resolver = async () => ({
      values: {},
      errors: {
        state: { type: "validate", message: "Escolha o estado", ref: undefined },
      } as never,
    });
    render(<Formulario aoEnviar={vi.fn()} resolver={resolver} />);
    fireEvent.click(screen.getByText("enviar"));
    await waitFor(() => expect(gatilho()).toHaveFocus());
    expect(screen.getByText("Escolha o estado")).toBeInTheDocument();
    expect(gatilho()).toHaveAttribute("aria-invalid", "true");
  });
});
