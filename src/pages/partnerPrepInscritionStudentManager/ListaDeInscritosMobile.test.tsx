import { Bool } from "@/enums/bool";
import { StatusApplication } from "@/enums/prepCourse/statusApplication";
import { XLSXStudentCourseFull } from "@/types/partnerPrepCourse/studentCourseFull";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ListaDeInscritosMobile,
  TAMANHO_DA_PAGINA,
} from "./ListaDeInscritosMobile";

const inscrito = (i: number): XLSXStudentCourseFull =>
  ({
    id: `id-${i}`,
    userId: `user-${i}`,
    nome: `aluno${i}`,
    sobrenome: "silva",
    email: `aluno${i}@x.com`,
    cpf: `000${i}`,
    status: StatusApplication.UnderReview,
    isento: Bool.No,
    lista_de_espera: Bool.No,
    convocar: Bool.No,
    data_convocacao: null,
    data_limite_convocacao: null,
  }) as unknown as XLSXStudentCourseFull;

const renderLista = (n: number, ranking?: Map<string, number>) =>
  render(
    <ListaDeInscritosMobile
      inscritos={Array.from({ length: n }, (_, i) => inscrito(i + 1))}
      rankingMap={ranking ?? null}
      renderAcoes={(i) => <button>ações de {i.id}</button>}
    />,
  );

describe("ListaDeInscritosMobile", () => {
  it("mostra nome, email, status, posição e as ações de cada inscrito", () => {
    renderLista(1, new Map([["user-1", 3]]));
    expect(screen.getByText("Aluno1 Silva")).toBeInTheDocument();
    expect(screen.getByText("aluno1@x.com")).toBeInTheDocument();
    expect(screen.getByText(StatusApplication.UnderReview)).toBeInTheDocument();
    expect(screen.getByText("3º")).toBeInTheDocument();
    expect(screen.getByText("ações de id-1")).toBeInTheDocument();
  });

  it("mostra uma página por vez e carrega mais", () => {
    renderLista(TAMANHO_DA_PAGINA + 5);
    expect(screen.getAllByRole("listitem")).toHaveLength(TAMANHO_DA_PAGINA);
    fireEvent.click(screen.getByText(/Mostrar mais \(5 restantes\)/));
    expect(screen.getAllByRole("listitem")).toHaveLength(TAMANHO_DA_PAGINA + 5);
    expect(screen.queryByText(/Mostrar mais/)).not.toBeInTheDocument();
  });

  it("busca por nome, email ou CPF", () => {
    renderLista(3);
    const busca = screen.getByLabelText("Buscar inscrito");
    fireEvent.change(busca, { target: { value: "aluno2@" } });
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    fireEvent.change(busca, { target: { value: "0003" } });
    expect(screen.getByText("Aluno3 Silva")).toBeInTheDocument();
    fireEvent.change(busca, { target: { value: "ninguém" } });
    expect(screen.getByText("Nenhum inscrito encontrado")).toBeInTheDocument();
  });
});
