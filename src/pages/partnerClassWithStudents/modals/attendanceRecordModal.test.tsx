import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const svc = vi.hoisted(() => ({ registro: vi.fn() }));

vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({
    data: { token: "tok", permissao: {}, user: { firstName: "Ana", lastName: "Lima" } },
  }),
}));
// O DataGrid não roda no jsdom: o dublê desenha só as células com renderCell.
vi.mock("@mui/x-data-grid", () => ({
  DataGrid: ({
    rows,
    columns,
  }: {
    rows: { id: string }[];
    columns: { field: string; renderCell?: (p: { row: unknown }) => React.ReactNode }[];
  }) => (
    <div>
      {rows.map((r) => (
        <div key={r.id}>
          {columns.map((c) =>
            c.renderCell ? <span key={c.field}>{c.renderCell({ row: r })}</span> : null,
          )}
        </div>
      ))}
    </div>
  ),
}));
vi.mock("@/services/prepCourse/attendanceRecord/getAttendanceRecordbyId", () => ({
  getAttendanceRecordById: svc.registro,
}));

import { AttendanceRecordModal } from "./attendanceRecordModal";

const aluno = (id: string, observation: unknown) => ({
  id,
  present: true,
  justification: undefined,
  observation,
  student: { name: `Aluno ${id}`, cod_enrolled: id },
});

describe("AttendanceRecordModal — observação", () => {
  it("só a observação com autor e data ganha tooltip", async () => {
    svc.registro.mockResolvedValue({
      registeredAt: new Date("2026-01-02T10:00:00"),
      period: undefined,
      studentAttendance: [
        aluno("1", { text: "Com autor", by: "Ana", at: "2026-01-02T10:00:00" }),
        aluno("2", { text: "Sem autor", by: "", at: "" }),
      ],
    });
    render(<AttendanceRecordModal isOpen handleClose={vi.fn()} attendanceId="a" />);

    expect(await screen.findByText("Com autor")).toHaveAttribute("data-state");
    expect(screen.getByText("Sem autor")).not.toHaveAttribute("data-state");
  });
});
