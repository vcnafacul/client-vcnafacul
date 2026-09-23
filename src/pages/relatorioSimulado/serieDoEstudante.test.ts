import type { PontoDaSerie } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { describe, expect, it } from "vitest";
import {
  MINIMO_PARA_SERIE,
  pontosDesenhados,
  textoDaVariacao,
  variacaoDoAluno,
  variacaoDoRecorte,
} from "./serieDoEstudante";

const ponto = (
  aproveitamento: number,
  mediaDoRecorte: number | null = 0.5,
  id = `s${aproveitamento}`,
): PontoDaSerie => ({
  simuladoId: id,
  nome: `Prova ${id}`,
  aproveitamento,
  em: "2026-03-10T00:00:00.000Z",
  mediaDoRecorte,
  baseDoRecorte: mediaDoRecorte === null ? 0 : 27,
});

describe("pontosDesenhados", () => {
  it("⚠️ o eixo X é a POSIÇÃO, não a data", () => {
    /*
      Espaçar por tempo faria dois simulados da mesma semana virarem um borrão e
      um intervalo de férias virar metade do gráfico — e a pergunta é "melhorou
      entre uma aplicação e a seguinte".
    */
    const r = pontosDesenhados([ponto(0.4), ponto(0.5), ponto(0.6)]);

    expect(r.map((p) => p.x)).toEqual([0, 0.5, 1]);
  });

  it("⚠️ um ponto só não vira NaN", () => {
    // `pontos.length - 1` seria zero, e toda coordenada viraria NaN — que o SVG
    // desenha como nada, sem erro nenhum.
    const r = pontosDesenhados([ponto(0.4)]);

    expect(r[0].x).toBe(0);
    expect(Number.isNaN(r[0].x)).toBe(false);
  });

  it("lista vazia não explode", () => {
    expect(pontosDesenhados([])).toEqual([]);
  });

  it("⚠️ ponto sem média do recorte mantém `null` — o traço FALHA, não cai", () => {
    const r = pontosDesenhados([ponto(0.4, null)]);

    expect(r[0].yTurma).toBeNull();
    expect(r[0].yAluno).toBe(0.4);
  });
});

describe("variacaoDoAluno", () => {
  it("é a diferença entre o primeiro e o último, em p.p.", () => {
    expect(variacaoDoAluno([ponto(0.4), ponto(0.5), ponto(0.62)])).toBe(22);
  });

  it("queda vem negativa", () => {
    expect(variacaoDoAluno([ponto(0.62), ponto(0.55)])).toBe(-7);
  });

  it(`⚠️ menos de ${MINIMO_PARA_SERIE} pontos é null, e não zero`, () => {
    // Zero afirmaria "ficou igual"; sem o segundo ponto não existe variação.
    expect(variacaoDoAluno([ponto(0.4)])).toBeNull();
    expect(variacaoDoAluno([])).toBeNull();
  });
});

describe("variacaoDoRecorte", () => {
  it("é a variação da turma no mesmo intervalo", () => {
    expect(variacaoDoRecorte([ponto(0.62, 0.6), ponto(0.55, 0.5)])).toBe(-10);
  });

  it("⚠️ ponta sem média dá null — intervalo incompleto não é variação", () => {
    expect(variacaoDoRecorte([ponto(0.62, null), ponto(0.55, 0.5)])).toBeNull();
    expect(variacaoDoRecorte([ponto(0.62, 0.6), ponto(0.55, null)])).toBeNull();
  });
});

describe("textoDaVariacao", () => {
  it("⚠️ o caso que dá sentido ao card: aluno cai menos que a turma", () => {
    /*
      Cair de 62% para 55% parece piora. Com a turma caindo 10, o aluno SUBIU de
      posição — e ler isso do gráfico exige comparar duas inclinações de cabeça.
    */
    const texto = textoDaVariacao([ponto(0.62, 0.6), ponto(0.55, 0.5)])!;

    expect(texto).toContain("−7 p.p.");
    expect(texto).toContain("a turma: −10 p.p.");
  });

  it("subida vem com sinal explícito", () => {
    expect(textoDaVariacao([ponto(0.4, 0.4), ponto(0.5, 0.42)])).toContain(
      "+10 p.p.",
    );
  });

  it("sem a variação da turma, diz só a do aluno", () => {
    const texto = textoDaVariacao([ponto(0.4, null), ponto(0.5, 0.42)])!;

    expect(texto).toContain("+10 p.p.");
    expect(texto).not.toContain("a turma");
  });

  it("uma aplicação só não tem texto", () => {
    expect(textoDaVariacao([ponto(0.4)])).toBeNull();
  });

  it("⚠️ nunca afirma 'melhorou' ou 'piorou' sem a referência", () => {
    // Um aluno que caiu 7 numa turma que caiu 10 subiu de posição, e dizer
    // "piorou" ali seria factualmente defensável e pedagogicamente errado.
    const texto = textoDaVariacao([ponto(0.62, 0.6), ponto(0.55, 0.5)])!;

    expect(texto.toLowerCase()).not.toContain("piorou");
    expect(texto.toLowerCase()).not.toContain("melhorou");
  });
});
