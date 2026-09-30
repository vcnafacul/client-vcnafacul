import { CancelledStudent } from "@/types/partnerPrepCourse/cancelledStudent";
import { ClassStudent } from "@/types/partnerPrepCourse/classStudent";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AlunosMobile, TAMANHO_DA_PAGINA } from "./AlunosMobile";

const aluno = (i: number): ClassStudent =>
  ({
    id: `a-${i}`,
    name: `Aluno ${i}`,
    email: `aluno${i}@x.com`,
    cod_enrolled: `M${i}`,
    presencePercentage: 90,
    absencePercentage: 10,
    justifiedAbsencePercentage: null,
  }) as unknown as ClassStudent;

describe("AlunosMobile", () => {
  it("ativos: nome, email, matrícula, frequência e ações", () => {
    render(
      <AlunosMobile
        tipo="ativos"
        alunos={[aluno(1)]}
        renderAcoes={(a) => <button>ações de {a.id}</button>}
      />,
    );
    expect(screen.getByText("Aluno 1")).toBeInTheDocument();
    expect(screen.getByText("aluno1@x.com")).toBeInTheDocument();
    expect(screen.getByText("Matrícula M1")).toBeInTheDocument();
    expect(screen.getByText(/Presença 90%.*Faltas 10%.*Just\. —/)).toBeInTheDocument();
    expect(screen.getByText("ações de a-1")).toBeInTheDocument();
  });

  it("cancelados: sem ações, com data e justificativa", () => {
    const cancelado: CancelledStudent = {
      id: "c-1",
      name: "Fulano",
      email: "f@x.com",
      cod_enrolled: "M9",
      cancelledAt: new Date(2026, 8, 1),
      justification: "Mudou de cidade",
    };
    render(<AlunosMobile tipo="cancelados" alunos={[cancelado]} />);
    expect(screen.getByText("Cancelado em 01/09/2026")).toBeInTheDocument();
    expect(screen.getByText("Mudou de cidade")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /ações/ })).toBeNull();
  });

  it("busca e mostra uma página por vez", () => {
    render(
      <AlunosMobile
        tipo="ativos"
        alunos={Array.from({ length: TAMANHO_DA_PAGINA + 1 }, (_, i) => aluno(i + 1))}
        renderAcoes={() => null}
      />,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(TAMANHO_DA_PAGINA);
    fireEvent.click(screen.getByText(/Mostrar mais \(1 restantes\)/));
    expect(screen.getAllByRole("listitem")).toHaveLength(TAMANHO_DA_PAGINA + 1);
    fireEvent.change(screen.getByLabelText("Buscar aluno"), {
      target: { value: "M21" },
    });
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });
});
