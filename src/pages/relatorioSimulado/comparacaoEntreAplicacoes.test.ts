import type {
  LinhaDoRelatorio,
  RelatorioDoSimulado,
} from "@/dtos/relatorioSimulado/relatorioSimulado";
import { describe, expect, it } from "vitest";
import {
  acimaDaTurma,
  compararAplicacoes,
  formatarDelta,
} from "./comparacaoEntreAplicacoes";

const linha = (
  nome: string,
  aproveitamentoGeral?: number,
  over: Partial<LinhaDoRelatorio> = {},
): LinhaDoRelatorio => ({
  usuario: `u-${nome}`,
  nome,
  matricula: `m-${nome}`,
  turmaId: null,
  turmaNome: null,
  enviouCartao: true,
  status: aproveitamentoGeral === undefined ? "awaiting_omr" : "completed",
  aproveitamentoGeral,
  ...over,
});

const relatorio = (linhas: LinhaDoRelatorio[]): RelatorioDoSimulado =>
  ({ linhas, resumo: {} }) as RelatorioDoSimulado;

describe("compararAplicacoes (card 31)", () => {
  it("põe as duas notas e a diferença lado a lado", () => {
    const r = compararAplicacoes(
      relatorio([linha("Ana", 0.5)]),
      relatorio([linha("Ana", 0.62)]),
    );

    expect(r.linhas[0]).toMatchObject({
      nome: "Ana",
      antes: 0.5,
      depois: 0.62,
      delta: 12,
    });
  });

  it("queda vem negativa", () => {
    const r = compararAplicacoes(
      relatorio([linha("Ana", 0.62)]),
      relatorio([linha("Ana", 0.55)]),
    );

    expect(r.linhas[0].delta).toBe(-7);
  });

  it("⚠️ SÓ a interseção entra — quem fez uma só fica de fora", () => {
    /*
      Comparar a média de 27 alunos com a de 19 outros não é comparação. O card é
      explícito: o recorte tem de ser a interseção de quem fez as duas.
    */
    const r = compararAplicacoes(
      relatorio([linha("Ana", 0.5), linha("Bruno", 0.4)]),
      relatorio([linha("Ana", 0.6), linha("Carla", 0.7)]),
    );

    expect(r.linhas.map((l) => l.nome)).toEqual(["Ana"]);
  });

  it("⚠️ quem ficou de fora é CONTADO, dos dois lados", () => {
    /*
      Contar só o lado de `antes` esconderia os alunos que fizeram apenas a
      segunda aplicação — exatamente os que entraram na turma no meio do
      caminho. E o número precisa aparecer: sem ele, uma comparação de 1 aluno
      numa turma de 3 parece que perdeu gente.
    */
    const r = compararAplicacoes(
      relatorio([linha("Ana", 0.5), linha("Bruno", 0.4)]),
      relatorio([linha("Ana", 0.6), linha("Carla", 0.7)]),
    );

    expect(r.foraDaIntersecao).toBe(2);
  });

  it("⚠️ leitura NÃO concluída não entra, nem conta como zero", () => {
    const r = compararAplicacoes(
      relatorio([linha("Ana", 0.5), linha("Bruno")]),
      relatorio([linha("Ana", 0.6), linha("Bruno")]),
    );

    expect(r.linhas).toHaveLength(1);
  });

  it("⚠️ linha `failed` com nota VELHA não entra", () => {
    /*
      O `marcarFalha` do ms não limpa o `aproveitamento`, então filtrar pela
      presença da nota não basta — é a mesma dupla checagem do resto da série.
    */
    const r = compararAplicacoes(
      relatorio([linha("Ana", 0.5)]),
      relatorio([linha("Ana", 0.9, { status: "failed" })]),
    );

    expect(r.linhas).toEqual([]);
  });

  it("⚠️ a chave é usuario+matricula — com `usuario` sozinho as notas casam ERRADO", () => {
    /*
      A api monta as linhas sem `DISTINCT`: quem se matriculou por dois
      processos do mesmo cursinho vem duas vezes, com o MESMO `usuario`.

      ⚠️ **Contar linhas não basta, e este teste nasceu de uma mutação que
      sobreviveu a isso:** com a chave errada continuam saindo duas linhas — mas
      as duas casam com a última matrícula do mapa, e a matrícula de 2024
      passaria a ser comparada com a nota de 2025. A asserção tem de ser sobre
      os NÚMEROS, não sobre a quantidade.
    */
    const dois = [
      linha("Ana", 0.5, { matricula: "2024" }),
      linha("Ana", 0.7, { matricula: "2025" }),
    ];

    const r = compararAplicacoes(relatorio(dois), relatorio(dois));

    expect(r.linhas).toHaveLength(2);
    // cada matrícula comparada consigo mesma: delta zero nas duas
    expect(r.linhas.map((l) => l.delta)).toEqual([0, 0]);
    expect(r.linhas.map((l) => l.antes)).toEqual([0.5, 0.7]);
  });

  it("⚠️ a média é a da INTERSEÇÃO, não a do resumo de cada relatório", () => {
    /*
      O resumo de cada um inclui quem não fez a outra — e aí a "variação da
      turma" compararia dois grupos diferentes, que é o erro que este card
      existe para não cometer.

      Aqui: Ana 50→60 (+10). Bruno só fez a primeira e tirou 10%; se entrasse na
      média de `antes`, ela seria 30% e o delta viraria +30.
    */
    const r = compararAplicacoes(
      relatorio([linha("Ana", 0.5), linha("Bruno", 0.1)]),
      relatorio([linha("Ana", 0.6)]),
    );

    expect(r.deltaDaMedia).toBe(10);
  });

  it("interseção vazia dá média nula, não zero", () => {
    const r = compararAplicacoes(
      relatorio([linha("Ana", 0.5)]),
      relatorio([linha("Bruno", 0.6)]),
    );

    expect(r.linhas).toEqual([]);
    expect(r.deltaDaMedia).toBeNull();
  });

  it("⚠️ arredonda DEPOIS de subtrair", () => {
    // Arredondar as duas notas antes acumula dois erros de meio ponto, e um
    // aluno que ficou igual pode sair com "+1 p.p.".
    const r = compararAplicacoes(
      relatorio([linha("Ana", 0.555)]),
      relatorio([linha("Ana", 0.555)]),
    );

    expect(r.linhas[0].delta).toBe(0);
  });
});

describe("acimaDaTurma", () => {
  it("⚠️ cair MENOS que a turma é estar acima dela", () => {
    /*
      Um aluno que caiu 7 numa turma que caiu 10 SUBIU de posição. É a mesma
      leitura que o degrau 2 do card 17 pratica no gráfico — dizer "piorou" ali
      seria factualmente defensável e pedagogicamente errado.
    */
    expect(acimaDaTurma(-7, -10)).toBe(true);
  });

  it("subir menos que a turma é estar abaixo", () => {
    expect(acimaDaTurma(3, 10)).toBe(false);
  });

  it("sem média não afirma nada", () => {
    expect(acimaDaTurma(5, null)).toBeNull();
  });
});

describe("formatarDelta", () => {
  it("sinal sempre explícito", () => {
    expect(formatarDelta(14)).toBe("+14 p.p.");
    expect(formatarDelta(0)).toBe("0 p.p.");
  });

  it("negativo usa o menos tipográfico", () => {
    expect(formatarDelta(-9)).toBe("−9 p.p.");
  });
});
