import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DatePicker } from "./date-picker";
import { DateRangePicker } from "./date-range-picker";

// Popover + calendário custam segundos de CPU no jsdom: só quem abre o calendário ganha prazo maior.
const PRAZO_COM_CALENDARIO = 30000;

// Meio-dia em São Paulo: o dia é o mesmo em qualquer fuso do runner.
const doze = new Date("2026-11-12T15:00:00Z");

describe("DatePicker", () => {
  it("mostra o placeholder em pt-BR e a data formatada em dd/MM/yyyy", () => {
    const { rerender } = render(<DatePicker onChange={vi.fn()} aria-label="Data" />);
    expect(screen.getByRole("button", { name: "Data" }).textContent).toBe("Selecionar data");
    rerender(<DatePicker value={doze} onChange={vi.fn()} aria-label="Data" />);
    expect(screen.getByRole("button", { name: "Data" }).textContent).toBe("12/11/2026");
  });

  it("escolher um dia chama onChange com a meia-noite de São Paulo e fecha", () => {
    const onChange = vi.fn();
    render(<DatePicker value={doze} onChange={onChange} aria-label="Data" />);
    fireEvent.click(screen.getByRole("button", { name: "Data" }));
    fireEvent.click(screen.getByRole("button", { name: /15 de novembro/ }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as Date).toISOString()).toBe("2026-11-15T03:00:00.000Z");
    expect(screen.queryByRole("grid")).toBeNull();
  }, PRAZO_COM_CALENDARIO);

  it("o calendário abre em pt-BR", () => {
    render(<DatePicker value={doze} onChange={vi.fn()} aria-label="Data" />);
    fireEvent.click(screen.getByRole("button", { name: "Data" }));
    expect(screen.getByText("novembro 2026")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Próximo mês" })).toBeTruthy();
  }, PRAZO_COM_CALENDARIO);
});

describe("DateRangePicker", () => {
  it("resume o período e mostra o placeholder vazio", () => {
    const { rerender } = render(<DateRangePicker onChange={vi.fn()} aria-label="Período" />);
    expect(screen.getByRole("button", { name: "Período" }).textContent).toBe("Selecionar período");
    rerender(
      <DateRangePicker
        value={{ from: new Date("2026-11-03T15:00:00Z"), to: new Date("2026-11-07T15:00:00Z") }}
        onChange={vi.fn()}
        aria-label="Período"
      />,
    );
    expect(screen.getByRole("button", { name: "Período" }).textContent).toBe("03/11 – 07/11/2026");
  });
});
