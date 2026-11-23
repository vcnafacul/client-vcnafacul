import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const criar = vi.hoisted(() => vi.fn());
vi.mock("@/services/prepCourse/periodJustification/createPeriodJustification", () => ({
  createPeriodJustification: criar,
}));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));
vi.mock("@/hooks/useToastAsync", () => ({
  useToastAsync:
    () =>
    async ({ action, onSuccess, onFinally }: Record<string, () => unknown>) => {
      await action();
      onSuccess?.();
      onFinally?.();
    },
}));

import { PeriodJustificationModal } from "./periodJustificationModal";

// Calendário no jsdom custa CPU: o prazo é maior.
const PRAZO = 30000;

describe("Justificativa de período: datas do calendário", () => {
  beforeEach(() => vi.clearAllMocks());

  it("manda início e fim como yyyy-MM-dd do dia escolhido (em qualquer fuso)", async () => {
    criar.mockResolvedValue(undefined);
    render(
      <PeriodJustificationModal
        isOpen
        handleClose={vi.fn()}
        studentCourseId="s1"
        onSuccess={vi.fn()}
      />,
    );
    const confirmar = screen.getByRole("button", { name: "Confirmar" });
    expect(confirmar).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Período (início — fim)" }));
    fireEvent.click(screen.getByRole("button", { name: /(^|\s)10 de / }));
    fireEvent.click(screen.getByRole("button", { name: /(^|\s)12 de / }));
    // O calendário fecha ao completar o período
    expect(screen.queryByRole("grid")).toBeNull();

    fireEvent.change(screen.getByPlaceholderText("Descreva a justificativa..."), {
      target: { value: "Atestado" },
    });
    fireEvent.click(confirmar);

    await waitFor(() => expect(criar).toHaveBeenCalledTimes(1));
    const dto = criar.mock.calls[0][1];
    expect(dto.startDate).toMatch(/^\d{4}-\d{2}-10$/);
    expect(dto.endDate).toMatch(/^\d{4}-\d{2}-12$/);
    expect(dto.justification).toBe("Atestado");
  }, PRAZO);
});
