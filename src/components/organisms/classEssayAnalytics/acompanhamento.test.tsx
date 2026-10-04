import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const svc = vi.hoisted(() => ({
  listar: vi.fn(),
  mes: vi.fn(),
  refresh: vi.fn(),
}));
const toastMock = vi.hoisted(() => ({
  success: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
}));
vi.mock("react-toastify", () => ({ toast: toastMock }));
vi.mock("@/services/prepCourse/class/listClassEssayMonths", () => ({
  listClassEssayMonths: svc.listar,
}));
vi.mock("@/services/prepCourse/class/getClassEssayByMonth", () => ({
  getClassEssayByMonth: svc.mes,
}));
vi.mock("@/services/prepCourse/class/refreshClassEssayAnalytics", () => ({
  refreshClassEssayAnalytics: svc.refresh,
}));
vi.mock("@/components/molecules/essayEvolutionChart", () => ({
  EssayEvolutionChart: () => null,
}));
vi.mock("@/components/molecules/competenciaRadar", () => ({
  CompetenciaRadar: () => null,
}));

import { ClassEssayAnalytics } from "./index";

const lista = (meses: string[]) => ({
  classId: "c1",
  className: "Turma A",
  coursePeriod: { startDate: "2026-01-01", endDate: "2030-12-31", isActive: true },
  totalStudents: 10,
  months: meses.map((m) => ({ month: m, generatedAt: `${m}-28T00:00:00Z` })),
});

describe("Desempenho de redação: Gerar agora (tickets-documentacao, 09)", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
    svc.refresh.mockResolvedValue({ enqueued: [] });
    svc.mes.mockResolvedValue(null);
  });
  afterEach(() => vi.useRealTimers());

  it("⚠️ turma sem meses: os meses aparecem quando ficam prontos", async () => {
    svc.listar
      .mockResolvedValueOnce(lista([]))
      .mockResolvedValue(lista(["2026-04"]));
    const onSelect = vi.fn();
    render(
      <ClassEssayAnalytics
        classId="c1"
        token="t"
        podeAtualizar
        selectedMonth={null}
        onSelectMonth={onSelect}
      />,
    );
    fireEvent.click(await screen.findByText("Gerar agora"));
    expect(await screen.findByText("Gerando...")).toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(toastMock.success).toHaveBeenCalledWith("Relatório de redação gerado!");
    expect(onSelect).toHaveBeenLastCalledWith("2026-04");
  });
});
