import { describe, expect, it } from "vitest";
import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import {
  formatarPercentual,
  percentual,
  percentualDaAlternativa,
  percentualDeAcerto,
  percentualDeErro,
} from "./percentuais";

const questao = (over: Partial<QuestaoDoRelatorio>): QuestaoDoRelatorio => ({
  numero: 1,
  questaoId: "q1",
  respondentes: 10,
  acertos: 6,
  erros: 3,
  semLeitura: 1,
  porAlternativa: { A: 6, B: 2, C: 1, D: 0, E: 0 },
  alternativaCorreta: "A",
  discriminacao: 0.4,
  ...over,
});

describe("percentual", () => {
  it("arredonda para inteiro", () => {
    expect(percentual(1, 3)).toBe(33);
    expect(percentual(2, 3)).toBe(67);
  });

  it("⚠️ total zero devolve null, NÃO zero", () => {
    // Zero por cento afirma "ninguém acertou"; ausência de base é outra coisa.
    // A tela mostra travessão, como o resumo já faz com o aproveitamento.
    expect(percentual(0, 0)).toBeNull();
    expect(percentual(5, 0)).toBeNull();
  });

  it("total negativo também devolve null", () => {
    expect(percentual(1, -3)).toBeNull();
  });
});

describe("percentualDeAcerto e percentualDeErro", () => {
  it("⚠️ o denominador é respondentes, NÃO acertos + erros", () => {
    // 6 acertos de 10 respondentes = 60%. Sobre `acertos + erros` (9) daria
    // 67% — um número melhor, que esconderia do cálculo quem não foi lido.
    const q = questao({ respondentes: 10, acertos: 6, erros: 3, semLeitura: 1 });

    expect(percentualDeAcerto(q)).toBe(60);
    expect(percentualDeErro(q)).toBe(30);
  });

  it("⚠️ acerto% + erro% + semLeitura% fecha 100%", () => {
    // É a propriedade que justifica o denominador escolhido: a coluna "Sem
    // leitura" ao lado explica a diferença, em vez de ela sumir na conta.
    const q = questao({ respondentes: 10, acertos: 6, erros: 3, semLeitura: 1 });

    const soma =
      percentualDeAcerto(q)! + percentualDeErro(q)! + percentual(q.semLeitura, 10)!;
    expect(soma).toBe(100);
  });

  it("questão sem respondentes devolve null nos dois", () => {
    const q = questao({ respondentes: 0, acertos: 0, erros: 0, semLeitura: 0 });

    expect(percentualDeAcerto(q)).toBeNull();
    expect(percentualDeErro(q)).toBeNull();
  });

  it("todos acertaram dá 100% de acerto e 0% de erro", () => {
    const q = questao({ respondentes: 4, acertos: 4, erros: 0, semLeitura: 0 });

    expect(percentualDeAcerto(q)).toBe(100);
    expect(percentualDeErro(q)).toBe(0);
  });
});

describe("percentualDaAlternativa", () => {
  it("calcula sobre respondentes", () => {
    const q = questao({ respondentes: 10, porAlternativa: { A: 6, B: 2 } });

    expect(percentualDaAlternativa(q, "A")).toBe(60);
    expect(percentualDaAlternativa(q, "B")).toBe(20);
  });

  it("⚠️ alternativa sem marcação é 0%, e não travessão", () => {
    // Aqui a base existe: "0%" é a informação correta, ninguém marcou a letra.
    // O travessão fica reservado para quando não há o que dividir.
    const q = questao({ respondentes: 10, porAlternativa: { A: 10 } });

    expect(percentualDaAlternativa(q, "E")).toBe(0);
  });

  it("sem respondentes, a alternativa também é null", () => {
    const q = questao({ respondentes: 0, porAlternativa: {} });

    expect(percentualDaAlternativa(q, "A")).toBeNull();
  });

  it("⚠️ a soma das alternativas NÃO precisa fechar 100%", () => {
    // `semLeitura` é questão em branco OU dupla marcação, e o OMR descarta as
    // duas igual — nenhuma delas entra em `porAlternativa`. A diferença para
    // 100% é justamente ela.
    const q = questao({
      respondentes: 10,
      semLeitura: 4,
      porAlternativa: { A: 4, B: 2, C: 0, D: 0, E: 0 },
    });

    const soma = ["A", "B", "C", "D", "E"].reduce(
      (s, alt) => s + (percentualDaAlternativa(q, alt) ?? 0),
      0,
    );
    expect(soma).toBe(60);
  });
});

describe("formatarPercentual", () => {
  it("número vira porcentagem", () => {
    expect(formatarPercentual(42)).toBe("42%");
    expect(formatarPercentual(0)).toBe("0%");
  });

  it("null vira travessão", () => {
    expect(formatarPercentual(null)).toBe("—");
  });
});
