import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { SegmentedControl } from "./segmented-control";

// O Radix mede o item dentro de <form>; o jsdom não tem ResizeObserver.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const opcoes = [
  { value: "a", label: "Manhã" },
  { value: "b", label: "Tarde" },
  { value: "c", label: "Noite" },
];

function Controlado({ onValueChange = vi.fn(), nome = "Período" }) {
  const [v, setV] = useState("a");
  return (
    <SegmentedControl
      aria-label={nome}
      value={v}
      onValueChange={(n) => {
        onValueChange(n);
        setV(n);
      }}
      options={opcoes}
    />
  );
}

describe("SegmentedControl", () => {
  it("é um radiogroup nomeado, com um radio por opção", () => {
    render(<Controlado />);
    expect(screen.getByRole("radiogroup", { name: "Período" })).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: "Manhã" })).toBeChecked();
  });

  it("no tamanho md o item tem alvo de 44px abaixo de 768 (h-11)", () => {
    render(<Controlado />);
    for (const r of screen.getAllByRole("radio")) {
      expect(r.className).toContain("h-11");
      expect(r.className).toContain("sm:h-7");
    }
  });

  it("seta para a direita marca a opção seguinte e avisa", async () => {
    const espiao = vi.fn();
    render(<Controlado onValueChange={espiao} />);
    const manha = screen.getByRole("radio", { name: "Manhã" });
    manha.focus();
    fireEvent.keyDown(manha, { key: "ArrowRight" });
    // O Radix move o foco num setTimeout
    await waitFor(() => expect(espiao).toHaveBeenLastCalledWith("b"));
    expect(screen.getByRole("radio", { name: "Tarde" })).toBeChecked();
  });

  it("Enter e Espaço não enviam o formulário ao redor", () => {
    const envio = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={envio}>
        <Controlado />
      </form>,
    );
    const manha = screen.getByRole("radio", { name: "Manhã" });
    manha.focus();
    // Enter é cancelado (sem ele o navegador clicaria e enviaria o form)
    expect(fireEvent.keyDown(manha, { key: "Enter" })).toBe(false);
    // Espaço/clique: o item é type="button", não envia
    expect(manha).toHaveAttribute("type", "button");
    fireEvent.click(manha);
    expect(envio).not.toHaveBeenCalled();
  });

  it("a seta no último item não leva o foco ao grupo seguinte", async () => {
    render(
      <>
        <Controlado nome="Primeiro" />
        <Controlado nome="Segundo" />
      </>,
    );
    const primeiro = screen.getByRole("radiogroup", { name: "Primeiro" });
    const segundo = screen.getByRole("radiogroup", { name: "Segundo" });
    const ultimo = primeiro.querySelectorAll<HTMLElement>('[role="radio"]')[2];
    ultimo.focus();
    fireEvent.keyDown(ultimo, { key: "ArrowRight" });
    // volta ao começo do próprio grupo (loop), nunca vai ao seguinte
    await waitFor(() => expect(primeiro.querySelectorAll('[role="radio"]')[0]).toBe(document.activeElement));
    expect(segundo.contains(document.activeElement)).toBe(false);
  });

  it("aria-label é obrigatório no tipo", () => {
    // @ts-expect-error — sem aria-label não compila
    const semNome = <SegmentedControl value="a" onValueChange={() => {}} options={opcoes} />;
    expect(semNome).toBeTruthy();
  });
});
