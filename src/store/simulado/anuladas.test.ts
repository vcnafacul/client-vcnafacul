import { beforeEach, describe, expect, it } from "vitest";
import {
  nextQuestionActive,
  primeiraValida,
  priorQuestionActive,
  Question,
  useSimuladoStore,
} from ".";

/** n questões; `anuladas` = índices. Anulada nasce solved (como o getSimuladoById faz). */
const qs = (n: number, anuladas: number[] = [], resolvidas: number[] = []): Question[] =>
  Array.from({ length: n }, (_, i) => ({
    _id: `q${i}`,
    numero: i,
    solved: anuladas.includes(i) || resolvidas.includes(i),
    viewed: false,
    ...(anuladas.includes(i) ? { anulada: true } : {}),
  })) as never;

describe("simulado digital pula a anulada (042/11) — navegação", () => {
  it("Q1 anulada: começa na Q2", () => {
    expect(primeiraValida(qs(5, [0]))).toBe(1);
    expect(primeiraValida(qs(5))).toBe(0);
  });

  it("última anulada: da penúltima, 'próxima' volta ao começo pulando-a", () => {
    expect(nextQuestionActive(qs(5, [4]), 3)).toBe(0);
  });

  it("duas seguidas anuladas são puladas nos dois sentidos", () => {
    const q = qs(6, [2, 3]);
    expect(nextQuestionActive(q, 1)).toBe(4);
    expect(priorQuestionActive(q, 4)).toBe(1);
  });

  it("⚠️ fallback (todas respondidas) também pula a anulada — antes devolvia active ± 1", () => {
    const tudo = qs(5, [2], [0, 1, 3, 4]);
    expect(nextQuestionActive(tudo, 1)).toBe(3);
    expect(priorQuestionActive(tudo, 3)).toBe(1);
    // Fim da lista: volta ao começo.
    expect(nextQuestionActive(qs(3, [0], [1, 2]), 2)).toBe(1);
  });

  it("todas menos uma anuladas: fica nela", () => {
    const q = qs(4, [0, 1, 3], [2]);
    expect(primeiraValida(q)).toBe(2);
    expect(nextQuestionActive(q, 2)).toBe(2);
    expect(priorQuestionActive(q, 2)).toBe(2);
  });
});

describe("simulado digital pula a anulada (042/11) — store", () => {
  beforeEach(() => {
    useSimuladoStore.getState().simuladoBegin({
      _id: "s",
      title: "S",
      started: new Date(),
      finished: new Date(),
      nQuestion: 4,
      questions: qs(4, [0, 3]),
      questionActive: 1,
      duration: 60,
      finish: false,
    });
  });

  it("setActive numa anulada não faz nada", () => {
    useSimuladoStore.getState().setActive(0);
    expect(useSimuladoStore.getState().data.questionActive).toBe(1);
    useSimuladoStore.getState().setActive(2);
    expect(useSimuladoStore.getState().data.questionActive).toBe(2);
  });

  it("respondendo as válidas, o simulado finaliza (as anuladas não impedem)", () => {
    const s = useSimuladoStore.getState();
    s.setAnswer("A" as never);
    s.confirm();
    expect(useSimuladoStore.getState().data.questionActive).toBe(2);
    useSimuladoStore.getState().setAnswer("B" as never);
    useSimuladoStore.getState().confirm();
    useSimuladoStore.getState().isFinish();
    expect(useSimuladoStore.getState().data.finish).toBe(true);
  });
});
