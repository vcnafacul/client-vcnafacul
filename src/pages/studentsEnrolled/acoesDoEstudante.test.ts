import { describe, expect, it } from "vitest";
import { StatusApplication } from "@/enums/prepCourse/statusApplication";
import { acoesDeMatricula } from "./acoesDoEstudante";

describe("acoesDeMatricula (tickets-documentacao, 14)", () => {
  it("Matriculado: só cancelar", () => {
    expect(acoesDeMatricula(StatusApplication.Enrolled)).toEqual({
      cancelar: true,
      reativar: false,
    });
  });

  it("Matrícula Cancelada: só reativar", () => {
    expect(acoesDeMatricula(StatusApplication.EnrollmentCancelled)).toEqual({
      cancelar: false,
      reativar: true,
    });
  });

  it("⚠️ Matrícula Encerrada: nenhuma (antes aparecia Reativar)", () => {
    expect(acoesDeMatricula(StatusApplication.EnrollmentClosed)).toEqual({
      cancelar: false,
      reativar: false,
    });
  });
});
