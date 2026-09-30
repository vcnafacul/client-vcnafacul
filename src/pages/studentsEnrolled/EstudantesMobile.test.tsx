import { StatusApplication } from "@/enums/prepCourse/statusApplication";
import { StudentsDtoOutput } from "@/types/partnerPrepCourse/StudentsEnrolled";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EstudantesMobile } from "./EstudantesMobile";

const estudante = (i: number, comTurma = true): StudentsDtoOutput =>
  ({
    id: `e-${i}`,
    name: `Estudante ${i}`,
    email: `e${i}@x.com`,
    whatsapp: "11 99999-0000",
    cod_enrolled: `M${i}`,
    applicationStatus: StatusApplication.Enrolled,
    class: comTurma ? { id: "t", name: "Turma A", year: 2026 } : undefined,
  }) as unknown as StudentsDtoOutput;

const base = {
  pagina: 0,
  porPagina: 2,
  total: 5,
  onPagina: vi.fn(),
  renderAcoes: (e: StudentsDtoOutput) => <button>ações de {e.id}</button>,
};

describe("EstudantesMobile", () => {
  it("mostra nome, email, matrícula, turma, status e ações", () => {
    render(<EstudantesMobile {...base} estudantes={[estudante(1)]} />);
    expect(screen.getByText("Estudante 1")).toBeInTheDocument();
    expect(screen.getByText("e1@x.com")).toBeInTheDocument();
    expect(screen.getByText(/Matrícula M1 · Turma A/)).toBeInTheDocument();
    expect(screen.getByText(StatusApplication.Enrolled)).toBeInTheDocument();
    expect(screen.getByText("ações de e-1")).toBeInTheDocument();
  });

  it("pagina pelo servidor", () => {
    const onPagina = vi.fn();
    render(
      <EstudantesMobile
        {...base}
        onPagina={onPagina}
        estudantes={[estudante(1), estudante(2)]}
      />,
    );
    expect(screen.getByText("1 de 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));
    expect(onPagina).toHaveBeenCalledWith(1);
  });

  it("seleciona para carteirinha só quem é selecionável", () => {
    const onChange = vi.fn();
    render(
      <EstudantesMobile
        {...base}
        estudantes={[estudante(1), estudante(2, false)]}
        selecao={{
          selecionados: [],
          selecionavel: (e) => !!e.class,
          onChange,
        }}
      />,
    );
    expect(screen.getAllByRole("checkbox")).toHaveLength(1);
    fireEvent.click(
      screen.getByLabelText("Selecionar Estudante 1 para carteirinha"),
    );
    expect(onChange).toHaveBeenCalledWith(["e-1"]);
  });
});
