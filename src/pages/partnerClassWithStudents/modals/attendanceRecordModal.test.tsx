import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const svc = vi.hoisted(() => ({ registro: vi.fn() }));

vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({
    data: { token: "tok", permissao: {}, user: { firstName: "Ana", lastName: "Lima" } },
  }),
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

  it("ordena por nome ao clicar no cabeçalho e pagina de 10 em 10", async () => {
    svc.registro.mockResolvedValue({
      registeredAt: new Date("2026-01-02T10:00:00"),
      period: undefined,
      studentAttendance: [
        ...["c", "a", "b", "d", "e", "f", "g", "h", "i", "j", "k"].map((n) => ({
          ...aluno(n, null),
          student: { name: `Aluno ${n}`, cod_enrolled: n },
        })),
      ],
    });
    render(<AttendanceRecordModal isOpen handleClose={vi.fn()} attendanceId="a" />);
    await screen.findByText("Aluno c");
    // 11 alunos, 10 por página: o último (k) fica na página 2.
    expect(screen.queryByText("Aluno k")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /^Nome/ }));
    const nomes = () =>
      screen
        .getAllByRole("row")
        .slice(1)
        .map((r) => r.querySelector('[data-column-id="studentName"]')?.textContent);
    expect(nomes()[0]).toBe("Aluno a");
    fireEvent.click(screen.getByRole("button", { name: /^Nome/ }));
    expect(nomes()[0]).toBe("Aluno k");
  });
});
