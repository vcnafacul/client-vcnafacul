import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const svc = vi.hoisted(() => ({
  alunos: vi.fn(),
  historico: vi.fn(),
  excluir: vi.fn(),
  criar: vi.fn(),
}));
const toastMock = vi.hoisted(() => ({
  error: vi.fn(),
  warn: vi.fn(),
  loading: vi.fn(() => "id"),
  update: vi.fn(),
  dismiss: vi.fn(),
}));
vi.mock("react-toastify", () => ({ toast: toastMock }));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({
    data: {
      token: "tok",
      permissao: { gerenciarTurmas: true },
      user: { firstName: "Ana", lastName: "Lima" },
    },
  }),
}));
vi.mock("@/components/templates/modalTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
// O DataGrid não roda no jsdom: o dublê desenha só as células com ação.
vi.mock("@mui/x-data-grid", () => ({
  DataGrid: ({
    rows,
    columns,
  }: {
    rows: { id: string }[];
    columns: {
      field: string;
      renderCell?: (p: { row: unknown }) => React.ReactNode;
    }[];
  }) => (
    <div data-testid="data-grid">
      {rows.map((r) => (
        <div key={r.id}>
          {columns.map((c) =>
            c.renderCell ? (
              <span key={c.field}>{c.renderCell({ row: r })}</span>
            ) : null,
          )}
        </div>
      ))}
    </div>
  ),
}));
vi.mock(
  "@/services/prepCourse/attendanceRecord/getStudentToAttendanceRecord",
  () => ({ getStudentsToAttendanceRecord: svc.alunos }),
);
vi.mock("@/services/prepCourse/attendanceRecord/getAttendanceRecord", () => ({
  getAttendanceRecord: svc.historico,
}));
vi.mock("@/services/prepCourse/attendanceRecord/createAttendanceRecord", () => ({
  createAttendanceRecord: svc.criar,
}));
vi.mock("@/services/prepCourse/attendanceRecord/deleteAttendanceRecord", () => ({
  deleteAttendanceRecord: svc.excluir,
}));

import { AttendanceHistoryModal } from "./attendanceHistoryModal";
import { NewAttendanceRecordModal } from "./newAttendanceRecordModal";

describe("Novo Registro (tickets-documentacao, 11)", () => {
  beforeEach(() => vi.clearAllMocks());

  const abrir = () =>
    render(
      <NewAttendanceRecordModal
        isOpen
        handleClose={vi.fn()}
        classId="c1"
        handleNewAttendanceRecord={vi.fn()}
      />,
    );

  it("⚠️ turma sem matriculados: avisa e não deixa confirmar", async () => {
    svc.alunos.mockResolvedValue({ students: [] });
    abrir();
    expect(
      await screen.findByText("Esta turma não tem alunos matriculados."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Registrar chamada" })).toBeDisabled();
  });

  it("com alunos: lista e deixa confirmar", async () => {
    svc.alunos.mockResolvedValue({
      students: [{ id: "s1", name: "João", cod_enrolled: "1" }],
    });
    abrir();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Registrar chamada" })).toBeEnabled(),
    );
    expect(
      screen.queryByText("Esta turma não tem alunos matriculados."),
    ).toBeNull();
  });

  it("falha ao carregar: mostra o erro em vez de abrir vazia em silêncio", async () => {
    svc.alunos.mockRejectedValue({ statusCode: 403, message: "Forbidden" });
    abrir();
    await waitFor(() =>
      expect(toastMock.error).toHaveBeenCalledWith(
        "Você não tem permissão para fazer a chamada.",
      ),
    );
    expect(screen.getByRole("button", { name: "Registrar chamada" })).toBeDisabled();
  });

  it("todos começam ausentes; envia só quem foi marcado Presente", async () => {
    svc.alunos.mockResolvedValue({
      students: [
        { id: "s1", name: "João", cod_enrolled: "1" },
        { id: "s2", name: "Ana", cod_enrolled: "2" },
      ],
    });
    svc.criar.mockResolvedValue({ id: "r1" });
    abrir();
    const joao = await screen.findByRole("group", { name: "João" });
    expect(
      within(joao).getByRole("button", { name: "Ausente" }),
    ).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(within(joao).getByRole("button", { name: "Presente" }));
    fireEvent.click(screen.getByRole("button", { name: "Registrar chamada" }));

    await waitFor(() => expect(svc.criar).toHaveBeenCalled());
    expect(svc.criar.mock.calls[0][4]).toEqual(["s1"]);
  });

  it("Todos presentes marca a turma inteira e vira Desmarcar todos", async () => {
    svc.alunos.mockResolvedValue({
      students: [
        { id: "s1", name: "João", cod_enrolled: "1" },
        { id: "s2", name: "Ana", cod_enrolled: "2" },
      ],
    });
    abrir();
    fireEvent.click(
      await screen.findByRole("button", { name: "Todos presentes" }),
    );
    for (const nome of ["João", "Ana"])
      expect(
        within(screen.getByRole("group", { name: nome })).getByRole("button", {
          name: "Presente",
        }),
      ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Desmarcar todos" }));
    expect(
      within(screen.getByRole("group", { name: "Ana" })).getByRole("button", {
        name: "Ausente",
      }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("busca sem acento acha o nome com acento", async () => {
    svc.alunos.mockResolvedValue({
      students: [
        { id: "s1", name: "João", cod_enrolled: "1" },
        { id: "s2", name: "Ana", cod_enrolled: "2" },
      ],
    });
    abrir();
    await screen.findByRole("group", { name: "Ana" });
    fireEvent.change(screen.getByRole("searchbox", { name: "Buscar aluno" }), {
      target: { value: "joao" },
    });
    expect(screen.getByRole("group", { name: "João" })).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Ana" })).toBeNull();
  });

  describe("risco de evasão (tickets/054, card 04)", () => {
    const hoje = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    const dataDeHoje = `${hoje.getFullYear()}-${p(hoje.getMonth() + 1)}-${p(hoje.getDate())}`;

    const turma = (alertaEvasao: object | null) =>
      svc.alunos.mockResolvedValue({
        alertaEvasao,
        students: [
          // 2 faltas em 11 aulas: Ausente → 25%, Presente → 17%
          { id: "s1", name: "Joana", cod_enrolled: "1", aulas: 11, faltasNaoJustificadas: 2 },
          // 0 faltas: nunca em risco
          { id: "s2", name: "Aline", cod_enrolled: "2", aulas: 11, faltasNaoJustificadas: 0 },
          // justificada hoje por período
          {
            id: "s3",
            name: "César",
            cod_enrolled: "3",
            aulas: 11,
            faltasNaoJustificadas: 1,
            justificativasPorPeriodo: [{ inicio: dataDeHoje, fim: dataDeHoje }],
          },
        ],
      });

    it("selo e resumo seguem os toques", async () => {
      turma({ percentual: 15, minimoDeAulas: 10 });
      abrir();
      expect(
        await screen.findByLabelText("risco de evasão, 25% de faltas"),
      ).toBeInTheDocument();
      expect(screen.getByText(/aluno em risco de evasão/)).toBeInTheDocument();

      fireEvent.click(
        within(screen.getByRole("group", { name: "Joana" })).getByRole("button", {
          name: "Presente",
        }),
      );
      expect(
        screen.getByLabelText("risco de evasão, 17% de faltas"),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText(/risco de evasão, 25%/)).toBeNull();
    });

    it("justificado na data: etiqueta e sem selo", async () => {
      turma({ percentual: 15, minimoDeAulas: 10 });
      abrir();
      const cesar = await screen.findByRole("group", { name: "César" });
      const linha = cesar.closest("li")!;
      expect(within(linha).getByText("justificado")).toBeInTheDocument();
      expect(within(linha).queryByLabelText(/risco de evasão/)).toBeNull();
    });

    it("alerta desligado: nada de selo nem resumo", async () => {
      turma(null);
      abrir();
      await screen.findByRole("group", { name: "Joana" });
      expect(screen.queryByLabelText(/risco de evasão/)).toBeNull();
      expect(screen.queryByText(/em risco de evasão/)).toBeNull();
    });
  });
});

describe("excluir chamada (tickets-documentacao, 11)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    svc.historico.mockResolvedValue({
      data: [{ id: "r1", registeredAt: "2026-03-10", period: "MANHA" }],
      totalItems: 1,
    });
  });

  const excluir = async () => {
    render(
      <AttendanceHistoryModal isOpen handleClose={vi.fn()} classId="c1" />,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Excluir" }));
    fireEvent.click(await screen.findByRole("button", { name: "Confirmar" }));
  };

  it("sucesso: avisa e tira da lista", async () => {
    svc.excluir.mockResolvedValue(undefined);
    await excluir();
    await waitFor(() =>
      expect(toastMock.update).toHaveBeenCalledWith(
        "id",
        expect.objectContaining({ render: "Registro excluído!", type: "success" }),
      ),
    );
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Excluir" })).toBeNull(),
    );
  });

  it("⚠️ erro: avisa, fecha a confirmação e mantém o registro", async () => {
    svc.excluir.mockRejectedValue(new Error("Failed to fetch"));
    await excluir();
    await waitFor(() =>
      expect(toastMock.update).toHaveBeenCalledWith(
        "id",
        expect.objectContaining({
          render: "Erro ao excluir o registro",
          type: "error",
        }),
      ),
    );
    await waitFor(() =>
      expect(screen.queryByText("Tem certeza que deseja excluir esse registro?")).toBeNull(),
    );
    expect(screen.getByRole("button", { name: "Excluir" })).toBeInTheDocument();
  });
});
