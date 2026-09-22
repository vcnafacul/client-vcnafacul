import { describe, expect, it } from "vitest";
import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import {
  formatarDificuldade,
  indiceDeDificuldade,
} from "./dificuldadeDaQuestao";

const questao = (over: Partial<QuestaoDoRelatorio>): QuestaoDoRelatorio => ({
  numero: 1,
  questaoId: "q1",
  respondentes: 20,
  acertos: 12,
  erros: 6,
  semLeitura: 2,
  porAlternativa: {},
  alternativaCorreta: "A",
  ...over,
});

describe("indiceDeDificuldade", () => {
  it("indexa por questaoId, com percentual e base", () => {
    const mapa = indiceDeDificuldade([questao({})]);

    expect(mapa.get("q1")).toEqual({ percentual: 60, base: 20 });
  });

  it("⚠️ o percentual é o mesmo da aba de questões — sobre respondentes", () => {
    // 12 de 20 é 60%. Se este cálculo divergisse do da outra aba, a mesma
    // questão apareceria com dois números na mesma tela.
    const mapa = indiceDeDificuldade([
      questao({ respondentes: 20, acertos: 12, erros: 6, semLeitura: 2 }),
    ]);

    expect(mapa.get("q1")!.percentual).toBe(60);
  });

  it("⚠️ questão sem respondentes fica FORA do mapa, e não entra com zero", () => {
    // "0% acertaram" afirma que ninguém acertou; não haver base é outra coisa.
    const mapa = indiceDeDificuldade([
      questao({ questaoId: "vazia", respondentes: 0, acertos: 0, erros: 0 }),
    ]);

    expect(mapa.has("vazia")).toBe(false);
  });

  it("indexa várias questões", () => {
    const mapa = indiceDeDificuldade([
      questao({ questaoId: "a", respondentes: 10, acertos: 9 }),
      questao({ questaoId: "b", respondentes: 10, acertos: 1 }),
    ]);

    expect(mapa.get("a")!.percentual).toBe(90);
    expect(mapa.get("b")!.percentual).toBe(10);
  });

  it("lista vazia dá mapa vazio", () => {
    expect(indiceDeDificuldade([]).size).toBe(0);
  });
});

describe("formatarDificuldade", () => {
  it("⚠️ mostra a BASE junto do percentual", () => {
    // Num recorte de 3 estudantes, "100%" é verdadeiro e inútil. A base deixa
    // quem lê julgar a amostra, sem a tela esconder nada por um limiar
    // inventado.
    expect(formatarDificuldade({ percentual: 60, base: 20 })).toBe("60% de 20");
    expect(formatarDificuldade({ percentual: 100, base: 3 })).toBe("100% de 3");
  });

  it("questão ausente do índice vira travessão", () => {
    expect(formatarDificuldade(undefined)).toBe("—");
  });

  it("0% é mostrado como 0%, não como travessão", () => {
    expect(formatarDificuldade({ percentual: 0, base: 20 })).toBe("0% de 20");
  });
});
