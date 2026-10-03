import { describe, expect, it } from "vitest";
import { rankingDeEvasao } from "./turmas";

const turma = (
  id: string,
  alunos: number,
  cancelados: number,
  desistenciaInicial = 0,
) => ({
  id,
  nome: id,
  metricas: { alunos, cancelados, desistenciaInicial },
});

describe("rankingDeEvasao", () => {
  it("ordena da maior para a menor evasão", () => {
    const { turmas } = rankingDeEvasao([
      turma("A", 20, 2),
      turma("B", 20, 6),
      turma("C", 20, 4),
    ]);
    expect(turmas.map((t) => t.id)).toEqual(["B", "C", "A"]);
  });

  it("⚠️ turma com menos de 10 alunos aparece mas não leva o selo", () => {
    const r = rankingDeEvasao([turma("pequena", 5, 2), turma("A", 20, 3)]);
    expect(r.turmas[0].id).toBe("pequena");
    expect(r.destaqueId).toBe("A");
  });

  it("empate na taxa: o selo vai para quem tem mais cancelamentos", () => {
    const r = rankingDeEvasao([turma("A", 10, 1), turma("B", 20, 2)]);
    expect(r.destaqueId).toBe("B");
  });

  it("sem evasão nenhuma, nenhuma turma leva o selo; sem dado vai por último", () => {
    const r = rankingDeEvasao([
      { id: "sem", nome: "sem", metricas: {} },
      turma("A", 20, 0),
    ]);
    expect(r.destaqueId).toBeNull();
    expect(r.turmas.map((t) => t.id)).toEqual(["A", "sem"]);
  });
});
