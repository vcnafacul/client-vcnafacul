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
vi.mock("@/services/prepCourse/class/listClassSimuladoMonths", () => ({
  listClassSimuladoMonths: svc.listar,
}));
vi.mock("@/services/prepCourse/class/getClassSimuladoByMonth", () => ({
  getClassSimuladoByMonth: svc.mes,
}));
vi.mock("@/services/prepCourse/class/refreshClassSimuladoAnalytics", () => ({
  refreshClassSimuladoAnalytics: svc.refresh,
}));
// Gráficos não importam aqui (e o recharts não roda no jsdom).
vi.mock("@/components/molecules/classEvolutionChart", () => ({
  ClassEvolutionChart: () => <div data-testid="grafico" />,
}));
vi.mock("@/components/molecules/materiaRadar", () => ({
  MateriaRadar: () => null,
}));
vi.mock("@/components/molecules/frenteRadar", () => ({
  FrenteRadar: () => null,
}));

import { ClassSimuladoAnalytics } from "./index";

const lista = (meses: string[]) => ({
  classId: "c1",
  className: "Turma A",
  coursePeriod: {
    startDate: "2026-01-01",
    endDate: "2030-12-31",
    isActive: true,
  },
  totalStudents: 10,
  months: meses.map((m) => ({
    month: m,
    monthStart: `${m}-01`,
    monthEnd: `${m}-28`,
    geral: 50,
    studentsWithAtLeastOneCompletedAttempt: 5,
    totalAttemptsCompleted: 5,
    generatedAt: `${m}-28T00:00:00Z`,
  })),
});
const doMes = (m: string, generatedAt: string) => ({
  ...lista([m]).months[0],
  classId: "c1",
  className: "Turma A",
  generatedAt,
  materias: [],
});
const tick = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

describe("Desempenho de simulados: acompanhamento (tickets-documentacao, 09 e 10)", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-05-15T12:00:00Z"));
    vi.clearAllMocks();
    svc.refresh.mockResolvedValue({ enqueued: [] });
  });
  afterEach(() => vi.useRealTimers());

  it("⚠️ turma sem meses: Gerar agora mostra os meses quando ficam prontos", async () => {
    svc.listar
      .mockResolvedValueOnce(lista([])) // carga inicial
      .mockResolvedValueOnce(lista([])) // 1º ciclo: ainda vazio
      .mockResolvedValue(lista(["2026-04", "2026-05"]));
    svc.mes.mockResolvedValue(doMes("2026-05", "2026-05-15T12:00:20Z"));
    const onSelect = vi.fn();
    render(
      <ClassSimuladoAnalytics
        classId="c1"
        token="t"
        podeAtualizar
        selectedMonth={null}
        onSelectMonth={onSelect}
      />,
    );
    fireEvent.click(await screen.findByText("Gerar agora"));
    expect(await screen.findByText("Gerando...")).toBeInTheDocument();

    await tick(10_000);
    expect(toastMock.success).not.toHaveBeenCalled();
    await tick(10_000);
    expect(toastMock.success).toHaveBeenCalledWith(
      "Relatório de simulado gerado!",
    );
    expect(onSelect).toHaveBeenLastCalledWith("2026-05");
  });

  it("turma sem meses: demorando mais de 90 s, o botão volta e avisa", async () => {
    svc.listar.mockResolvedValue(lista([]));
    render(
      <ClassSimuladoAnalytics
        classId="c1"
        token="t"
        podeAtualizar
        selectedMonth={null}
        onSelectMonth={vi.fn()}
      />,
    );
    fireEvent.click(await screen.findByText("Gerar agora"));
    expect(await screen.findByText("Gerando...")).toBeInTheDocument();
    await tick(80_000);
    expect(toastMock.info).not.toHaveBeenCalledWith(
      expect.stringMatching(/^Ainda processando/),
    );
    await tick(10_000);
    expect(toastMock.info).toHaveBeenLastCalledWith(
      expect.stringMatching(/^Ainda processando/),
    );
    expect(screen.getByText("Gerar agora")).toBeInTheDocument();
  });

  it("⚠️ mês antigo selecionado: Atualizar mês atual troca para o mês atual e termina", async () => {
    svc.listar.mockResolvedValue(lista(["2026-03", "2026-04"]));
    svc.mes.mockImplementation(async (_c: string, m: string) =>
      m === "2026-03"
        ? doMes("2026-03", "2026-03-28T00:00:00Z")
        : doMes("2026-05", "2026-05-15T12:00:10Z"),
    );
    const onSelect = vi.fn();
    render(
      <ClassSimuladoAnalytics
        classId="c1"
        token="t"
        podeAtualizar
        selectedMonth="2026-03"
        onSelectMonth={onSelect}
      />,
    );
    fireEvent.click(await screen.findByText("Atualizar mês atual"));
    await tick(0);
    expect(onSelect).toHaveBeenCalledWith("2026-05");

    await tick(10_000);
    expect(toastMock.success).toHaveBeenCalledWith(
      "Dados de simulado atualizados!",
    );
    // O mês novo entra no seletor: a lista foi recarregada.
    expect(svc.listar).toHaveBeenCalledTimes(2);
  });
});
