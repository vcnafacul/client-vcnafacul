import { describe, expect, it, vi } from "vitest";

const f = vi.hoisted(() => vi.fn());
vi.mock("@/utils/fetchWrapper", () => ({ default: f }));
vi.mock("../../utils/fetchWrapper", () => ({ default: f }));

import { getSimuladoById } from "./getSimuladoById";

describe("getSimuladoById com anulada (042/11)", () => {
  it("anulada nasce resolvida e marcada; começa na primeira válida", async () => {
    const questao = (i: number, anulada = false) => ({
      _id: `q${i}`,
      materia: { nome: "Mat" },
      imageId: anulada ? undefined : `img${i}`,
      ...(anulada ? { anulada: true } : {}),
    });
    f.mockResolvedValue(
      new Response(
        JSON.stringify({ _id: "s", nome: "S", inicio: new Date(), duracao: 60, questoes: [questao(1, true), questao(2), questao(3)] }),
        { status: 200 },
      ),
    );
    const r = await getSimuladoById("s", "t");
    expect(r.questionActive).toBe(1);
    expect(r.questions.map((q) => [q.anulada ?? false, q.solved])).toEqual([
      [true, true],
      [false, false],
      [false, false],
    ]);
  });
});
