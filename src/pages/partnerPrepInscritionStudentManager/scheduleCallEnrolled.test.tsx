import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ScheduleCallEnrolle } from "./scheduleCallEnrolled";

// Calendário no jsdom custa CPU: o prazo é maior.
const PRAZO = 30000;

describe("Programar convocação: período do calendário", () => {
  it("sem escolher, mostra o erro e não envia", async () => {
    const enviar = vi.fn();
    render(<ScheduleCallEnrolle isOpen handleClose={vi.fn()} handleScheduleEnrolled={enviar} />);
    fireEvent.click(screen.getByRole("button", { name: "Confirma" }));
    expect(await screen.findByText(/Campo obrigatório|Selecione um intervalo/)).toBeTruthy();
    expect(enviar).not.toHaveBeenCalled();
  });

  it("envia [início, fim] como a meia-noite de São Paulo (em qualquer fuso)", async () => {
    const enviar = vi.fn();
    render(<ScheduleCallEnrolle isOpen handleClose={vi.fn()} handleScheduleEnrolled={enviar} />);
    fireEvent.click(screen.getByRole("button", { name: "Inicio - Fim" }));
    fireEvent.click(screen.getByRole("button", { name: /(^|\s)10 de / }));
    fireEvent.click(screen.getByRole("button", { name: /(^|\s)12 de / }));
    fireEvent.click(screen.getByRole("button", { name: "Confirma" }));
    await waitFor(() => expect(enviar).toHaveBeenCalledTimes(1));
    const [inicio, fim] = enviar.mock.calls[0][0] as Date[];
    expect(inicio.toISOString()).toMatch(/^\d{4}-\d{2}-10T0[23]:00:00\.000Z$/);
    expect(fim.toISOString()).toMatch(/^\d{4}-\d{2}-12T0[23]:00:00\.000Z$/);
  }, PRAZO);
});
