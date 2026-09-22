import { describe, expect, it } from "vitest";
import type { LinhaDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import {
  distribuicaoDaTurma,
  faixasDoHistograma,
  FAIXAS_DO_HISTOGRAMA,
  MINIMO_PARA_DISTRIBUICAO,
  MINIMO_PARA_HISTOGRAMA,
} from "./distribuicao";

const linha = (
  acertos: number | undefined,
  over: Partial<LinhaDoRelatorio> = {},
): LinhaDoRelatorio => ({
  usuario: `u${acertos}${over.status ?? ""}`,
  nome: "Ana",
  matricula: "1",
  turmaId: null,
  turmaNome: null,
  enviouCartao: true,
  status: "completed",
  acertos,
  aproveitamentoGeral: acertos === undefined ? undefined : acertos / 90,
  ...over,
});

const comAcertos = (lista: number[]) => lista.map((n) => linha(n));

describe("distribuicaoDaTurma", () => {
  it("⚠️ mediana de conjunto ÍMPAR é o valor do meio", () => {
    // 5 alunos: 10 20 30 40 50 → mediana 30
    expect(distribuicaoDaTurma(comAcertos([30, 10, 50, 20, 40])).mediana).toBe(
      30,
    );
  });

  it("⚠️ mediana de conjunto PAR é a média dos dois do meio", () => {
    // 6 alunos: 10 20 30 40 50 60 → mediana 35
    expect(
      distribuicaoDaTurma(comAcertos([30, 10, 50, 20, 40, 60])).mediana,
    ).toBe(35);
  });

  it("mín e máx são os extremos, e a ordem de entrada não importa", () => {
    const d = distribuicaoDaTurma(comAcertos([30, 10, 50, 20, 40]));

    expect(d.minimo).toBe(10);
    expect(d.maximo).toBe(50);
  });

  it("⚠️ os quartis INTERPOLAM, como o Excel e o R fazem", () => {
    // 10 20 30 40 50: Q1 na posição (5−1)×0,25 = 1 → 20; Q3 na posição 3 → 40.
    const d = distribuicaoDaTurma(comAcertos([10, 20, 30, 40, 50]));
    expect(d.q1).toBe(20);
    expect(d.q3).toBe(40);

    // 10 20 30 40 50 60: Q1 na posição 1,25 → 20 + 0,25×(30−20) = 22,5
    const par = distribuicaoDaTurma(comAcertos([10, 20, 30, 40, 50, 60]));
    expect(par.q1).toBe(22.5);
    expect(par.q3).toBe(47.5);
  });

  it("⚠️ a turma BIMODAL tem a mesma média e Q1–Q3 muito diferente", () => {
    // É a razão de existir deste card. Duas turmas com média ~45:
    const homogenea = distribuicaoDaTurma(comAcertos([43, 44, 45, 46, 47]));
    const bimodal = distribuicaoDaTurma(comAcertos([20, 21, 45, 69, 70]));

    expect(homogenea.mediana).toBe(bimodal.mediana);
    // e no entanto a metade do meio de uma cabe em 2 pontos e a da outra em 48
    expect(homogenea.q3! - homogenea.q1!).toBe(2);
    expect(bimodal.q3! - bimodal.q1!).toBe(48);
  });

  it(`⚠️ abaixo de ${MINIMO_PARA_DISTRIBUICAO} tudo vira null, e não zero`, () => {
    // Mediana de 2 alunos é afirmação sem conteúdo. Zero diria que a turma
    // zerou, que é outra coisa.
    const d = distribuicaoDaTurma(comAcertos([10, 20, 30, 40]));

    expect(d).toMatchObject({
      base: 4,
      mediana: null,
      minimo: null,
      maximo: null,
      q1: null,
      q3: null,
    });
  });

  it(`exatamente ${MINIMO_PARA_DISTRIBUICAO} já calcula — a borda é inclusiva`, () => {
    expect(distribuicaoDaTurma(comAcertos([1, 2, 3, 4, 5])).mediana).toBe(3);
  });

  it("⚠️ só entra quem tem leitura concluída E acertos", () => {
    // O MESMO conjunto do "Aproveitamento médio". Se a distribuição usasse
    // outro, a mediana e a média do resumo falariam de turmas diferentes — e
    // quem lê as duas lado a lado não teria como saber.
    const d = distribuicaoDaTurma([
      ...comAcertos([10, 20, 30, 40, 50]),
      linha(99, { status: "failed" }),
      linha(99, { status: "pending" }),
      // histórico anterior ao card 08: `completed`, mas sem acertos
      linha(undefined),
    ]);

    expect(d.base).toBe(5);
    expect(d.maximo).toBe(50);
  });

  it("base zero não estoura", () => {
    expect(distribuicaoDaTurma([])).toMatchObject({ base: 0, mediana: null });
  });
});

describe("faixasDoHistograma", () => {
  const oito = comAcertos([5, 15, 25, 35, 45, 55, 65, 75]);

  it(`desenha ${FAIXAS_DO_HISTOGRAMA} faixas cobrindo 0 até o total`, () => {
    const f = faixasDoHistograma(oito, 80);

    expect(f).toHaveLength(FAIXAS_DO_HISTOGRAMA);
    expect(f[0].de).toBe(0);
    expect(f[FAIXAS_DO_HISTOGRAMA - 1].ate).toBe(80);
  });

  it("⚠️ as faixas NÃO se sobrepõem — ninguém é contado duas vezes", () => {
    // Limites inclusivos dos dois lados: sem o `- 1`, quem fez 10 cairia na
    // faixa 0-10 e na 10-20.
    const f = faixasDoHistograma(oito, 80);

    for (let i = 1; i < f.length; i++) {
      expect(f[i].de).toBe(f[i - 1].ate + 1);
    }
  });

  it("⚠️ a soma das faixas é a base inteira", () => {
    // A invariante que pega um limite errado: alguém sumindo entre duas faixas
    // faz o histograma mentir sem parecer errado.
    const f = faixasDoHistograma(oito, 80);

    expect(f.reduce((s, x) => s + x.quantos, 0)).toBe(oito.length);
  });

  it("⚠️ o eixo é 0..total, e não mín..máx", () => {
    // Uma turma toda entre 40 e 45 tem de parecer CONCENTRADA à direita, não
    // espalhada — e dois simulados do mesmo tamanho precisam do mesmo eixo,
    // senão distribuições diferentes desenham barras iguais.
    const concentrada = comAcertos([40, 41, 42, 43, 44, 45, 44, 43]);
    const f = faixasDoHistograma(concentrada, 80);

    expect(f[0].quantos).toBe(0);
    expect(f[FAIXAS_DO_HISTOGRAMA - 1].quantos).toBe(0);
    expect(f.filter((x) => x.quantos > 0)).toHaveLength(1);
  });

  it(`⚠️ abaixo de ${MINIMO_PARA_HISTOGRAMA} não desenha nada`, () => {
    // Quatro barras de altura 1 PARECEM uma distribuição — e um gráfico ruim a
    // pessoa acredita, enquanto um número ruim ela questiona.
    expect(faixasDoHistograma(comAcertos([10, 20, 30, 40, 50]), 80)).toEqual([]);
  });

  it(`exatamente ${MINIMO_PARA_HISTOGRAMA} já desenha`, () => {
    expect(faixasDoHistograma(oito, 80)).toHaveLength(FAIXAS_DO_HISTOGRAMA);
  });

  it("⚠️ total 0 não desenha — não há eixo", () => {
    // ms anterior ao card 08. Dividir por zero daria faixas `NaN..NaN`.
    expect(faixasDoHistograma(oito, 0)).toEqual([]);
  });

  it("⚠️ acertos ACIMA do total caem na última faixa, e não somem", () => {
    // Dado inconsistente (a invariante do ms diz que não acontece, mas ela vale
    // para o que ele grava, não para o que já está gravado). Sumir em silêncio
    // faria a soma das barras discordar da base ao lado, sem nada acusar.
    const comIntruso = comAcertos([5, 15, 25, 35, 45, 55, 65, 999]);
    const f = faixasDoHistograma(comIntruso, 80);

    expect(f.reduce((s, x) => s + x.quantos, 0)).toBe(8);
    expect(f[FAIXAS_DO_HISTOGRAMA - 1].quantos).toBe(1);
  });

  it("total que não divide por 8 não perde nem duplica ninguém", () => {
    // 90 questões / 8 = 11,25 — o caso real do ENEM por dia.
    const muitos = comAcertos([0, 11, 12, 22, 45, 67, 89, 90, 45, 45]);
    const f = faixasDoHistograma(muitos, 90);

    expect(f.reduce((s, x) => s + x.quantos, 0)).toBe(muitos.length);
    expect(f[0].de).toBe(0);
    expect(f[7].ate).toBe(90);
    for (let i = 1; i < f.length; i++) {
      expect(f[i].de).toBe(f[i - 1].ate + 1);
    }
  });
});
