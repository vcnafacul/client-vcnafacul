/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createGeolocation, etapa } = vi.hoisted(() => {
  const createGeolocation = vi.fn();
  // Cada etapa vira um dublê: mostra o título e o que já foi preenchido, e tem os botões com o campo dela.
  const etapa =
    (campo: string) =>
    ({ title, updateData, handleBack, dataGeo, reset }: any) => (
      <div>
        <h1>{title}</h1>
        <pre data-testid="dados">{JSON.stringify(dataGeo ?? {})}</pre>
        {updateData && (
          <button onClick={() => updateData({ [campo]: `${campo}-ok` })}>
            avançar
          </button>
        )}
        {handleBack && (
          <button onClick={() => handleBack({ [campo]: `${campo}-rascunho` })}>
            voltar
          </button>
        )}
        {reset && <button onClick={reset}>novo</button>}
      </div>
    );
  return { createGeolocation, etapa };
});
vi.mock("../../../services/geolocation/createGeolocation", () => ({
  createGeolocation: (d: unknown) => createGeolocation(d),
}));
vi.mock("@/hooks/useToastAsync", () => ({
  useToastAsync:
    () =>
    async ({ action, onSuccess }: any) => {
      await action();
      onSuccess?.();
    },
}));

vi.mock("./steps/step1", () => ({ default: etapa("pessoal") }));
vi.mock("./steps/step2", () => ({ default: etapa("cursinho") }));
vi.mock("./steps/step3", () => ({ default: etapa("endereco") }));
vi.mock("./steps/step4", () => ({ default: etapa("contato") }));
vi.mock("./steps/step5", () => ({ default: etapa("redes") }));
vi.mock("./steps/step6", () => ({ default: etapa("fim") }));

import GeoForm from ".";

const passo = (title: string) => ({ title, subtitle: "", form: [] });
const formData = {
  step1: passo("Dados Pessoais"),
  step2: passo("Dados do Cursinho"),
  step3: passo("Endereço"),
  step4: passo("Contatos"),
  step5: passo("Canais digitais"),
  step6: passo("Sucesso"),
};
const titulo = () => screen.getByRole("heading").textContent;
const dados = () => JSON.parse(screen.getByTestId("dados").textContent!);
const avancar = () => fireEvent.click(screen.getByText("avançar"));

describe("GeoForm — Dados Pessoais por último (card 11)", () => {
  beforeEach(() => createGeolocation.mockReset().mockResolvedValue({}));

  it("começa em Dados do Cursinho, sem Voltar, com o nome da busca", () => {
    render(<GeoForm formData={formData} nomeInicial="Cursinho da Vila" />);
    expect(titulo()).toBe("Dados do Cursinho");
    expect(screen.queryByText("voltar")).not.toBeInTheDocument();
    expect(dados()).toEqual({ name: "Cursinho da Vila" });
  });

  it("ordem nova; só envia em Dados Pessoais, com tudo junto", async () => {
    render(<GeoForm formData={formData} />);
    const ordem: (string | null)[] = [titulo()];
    for (let i = 0; i < 4; i++) {
      avancar();
      ordem.push(titulo());
    }
    expect(ordem).toEqual([
      "Dados do Cursinho",
      "Endereço",
      "Contatos",
      "Canais digitais",
      "Dados Pessoais",
    ]);
    expect(createGeolocation).not.toHaveBeenCalled();

    avancar();
    await waitFor(() => expect(titulo()).toBe("Sucesso"));
    expect(createGeolocation).toHaveBeenCalledTimes(1);
    expect(createGeolocation).toHaveBeenCalledWith({
      cursinho: "cursinho-ok",
      endereco: "endereco-ok",
      contato: "contato-ok",
      redes: "redes-ok",
      pessoal: "pessoal-ok",
    });
  });

  it("Voltar guarda o que foi digitado na etapa", () => {
    render(<GeoForm formData={formData} />);
    avancar(); // Endereço
    avancar(); // Contatos
    fireEvent.click(screen.getByText("voltar"));
    expect(titulo()).toBe("Endereço");
    expect(dados()).toMatchObject({ contato: "contato-rascunho" });
  });

  it("depois do sucesso, 'novo' recomeça em Dados do Cursinho, limpo", async () => {
    render(<GeoForm formData={formData} nomeInicial="X" />);
    for (let i = 0; i < 5; i++) avancar();
    await waitFor(() => expect(titulo()).toBe("Sucesso"));
    fireEvent.click(screen.getByText("novo"));
    expect(titulo()).toBe("Dados do Cursinho");
    expect(dados()).toEqual({});
  });
});
