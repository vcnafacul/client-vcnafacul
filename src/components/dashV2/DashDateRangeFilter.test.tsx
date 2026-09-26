import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { DashDateRangeFilter, TEXTO_INTERVALO_INVERTIDO } from "./DashDateRangeFilter";
import type { IntervaloDeDatas } from "./intervaloDeDatas";

/** A tela dona do valor, com um "Limpar" de fora — como a DashFilterBar. */
function Tela({ inicial = {} as IntervaloDeDatas, espiao = vi.fn() }) {
  const [valor, setValor] = useState<IntervaloDeDatas>(inicial);
  return (
    <>
      <DashDateRangeFilter
        label="Inicia em"
        value={valor}
        onChange={(v) => {
          espiao(v);
          setValor(v);
        }}
      />
      <button onClick={() => setValor({})}>limpar</button>
    </>
  );
}

const de = () => screen.getByLabelText("Inicia em — de") as HTMLInputElement;
const ate = () => screen.getByLabelText("Inicia em — até") as HTMLInputElement;

describe("DashDateRangeFilter (tickets/021 card 03)", () => {
  it("dois campos de data, com rótulos completos para o leitor de tela, num grupo nomeado", () => {
    render(<Tela />);
    expect(de().type).toBe("date");
    expect(ate().type).toBe("date");
    expect(screen.getByRole("group", { name: "Inicia em" })).toBeTruthy();
  });

  it("devolve yyyy-mm-dd; apagar um lado vira undefined", () => {
    const espiao = vi.fn();
    render(<Tela espiao={espiao} />);

    fireEvent.change(de(), { target: { value: "2026-03-10" } });
    expect(espiao).toHaveBeenLastCalledWith({ de: "2026-03-10" });

    fireEvent.change(ate(), { target: { value: "2026-03-20" } });
    expect(espiao).toHaveBeenLastCalledWith({ de: "2026-03-10", ate: "2026-03-20" });

    fireEvent.change(de(), { target: { value: "" } });
    expect(espiao).toHaveBeenLastCalledWith({ de: undefined, ate: "2026-03-20" });
  });

  it("⚠️ controlado: limpar por fora zera os campos, sem remontar", () => {
    render(<Tela inicial={{ de: "2026-03-10", ate: "2026-03-20" }} />);
    const campo = de();

    fireEvent.click(screen.getByText("limpar"));

    expect(de()).toBe(campo); // o mesmo elemento: não remontou
    expect(de().value).toBe("");
    expect(ate().value).toBe("");
  });

  it("cada lado limita o outro no seletor (min/max)", () => {
    render(<Tela inicial={{ de: "2026-03-10", ate: "2026-03-20" }} />);
    expect(ate().min).toBe("2026-03-10");
    expect(de().max).toBe("2026-03-20");
  });

  it("⚠️ intervalo invertido: avisa, marca os campos inválidos e liga o aviso a eles", () => {
    render(<Tela inicial={{ de: "2026-03-20", ate: "2026-03-10" }} />);

    const aviso = screen.getByRole("alert");
    expect(aviso.textContent).toBe(TEXTO_INTERVALO_INVERTIDO);
    expect(de().getAttribute("aria-invalid")).toBe("true");
    expect(de().getAttribute("aria-describedby")).toBe(aviso.id);
  });

  it("intervalo válido: sem aviso", () => {
    render(<Tela inicial={{ de: "2026-03-10", ate: "2026-03-20" }} />);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(de().getAttribute("aria-invalid")).toBeNull();
  });
});
