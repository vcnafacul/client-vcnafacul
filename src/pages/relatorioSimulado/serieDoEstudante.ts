import type { PontoDaSerie } from "@/dtos/relatorioSimulado/relatorioSimulado";

/**
 * Quantos pontos a série precisa para virar gráfico.
 *
 * ⚠️ **Dois, e é o mínimo conceitual — não um limiar estatístico.** Um simulado
 * dá um retrato; o segundo dá uma direção, que é a razão de aplicar o segundo.
 * Com um ponto só não há "melhorou", e desenhar um eixo com uma bolinha
 * sugere tendência onde não há nenhuma.
 */
export const MINIMO_PARA_SERIE = 2;

export interface PontoDesenhado {
  ponto: PontoDaSerie;
  /** 0 = esquerda, 1 = direita. */
  x: number;
  /** 0 = base, 1 = topo. Fração de acerto do ALUNO. */
  yAluno: number;
  /** ⚠️ `null` quando o recorte não tem média ali — o traço FALHA, não cai. */
  yTurma: number | null;
}

/**
 * As coordenadas de cada ponto, em fração de 0 a 1.
 *
 * ⚠️ **O eixo X é a POSIÇÃO na série, não a data.** Espaçar por tempo faria
 * dois simulados aplicados na mesma semana virarem um borrão e um intervalo de
 * férias virar metade do gráfico — e a pergunta é "melhorou entre uma aplicação
 * e a seguinte", não "melhorou por mês".
 *
 * ⚠️ **O eixo Y vai de 0 a 100%, sempre.** Escalar ao mínimo e máximo do aluno
 * transforma uma variação de 2 pontos num gráfico dramático — é o truque
 * clássico de gráfico enganoso, e aqui ele mentiria para quem vai conversar com
 * a família.
 */
export function pontosDesenhados(pontos: PontoDaSerie[]): PontoDesenhado[] {
  if (pontos.length === 0) return [];
  /*
    ⚠️ Divisor mínimo 1: com um ponto só, `pontos.length - 1` é zero e toda
    coordenada viraria `NaN` — que o SVG desenha como nada, sem erro nenhum.
  */
  const divisor = Math.max(1, pontos.length - 1);
  return pontos.map((ponto, i) => ({
    ponto,
    x: i / divisor,
    yAluno: ponto.aproveitamento,
    yTurma: ponto.mediaDoRecorte,
  }));
}

/**
 * A variação entre o primeiro e o último ponto, em pontos percentuais.
 *
 * ⚠️ **Do primeiro ao ÚLTIMO, e não a soma dos trechos** — são a mesma coisa em
 * aritmética, mas dizer isso evita que alguém "melhore" o cálculo somando
 * variações e acumulando erro de arredondamento.
 *
 * ⚠️ `null` com menos de dois pontos: sem o segundo não existe variação, e zero
 * afirmaria "ficou igual".
 */
export function variacaoDoAluno(pontos: PontoDaSerie[]): number | null {
  if (pontos.length < MINIMO_PARA_SERIE) return null;
  const primeiro = pontos[0].aproveitamento;
  const ultimo = pontos[pontos.length - 1].aproveitamento;
  return Math.round((ultimo - primeiro) * 100);
}

/**
 * A variação do RECORTE no mesmo intervalo.
 *
 * ⚠️ **É ela que dá sentido à do aluno**, e é o ponto inteiro do card: se a
 * turma caiu 10 e o aluno caiu 7, o aluno melhorou em relação a ela. Sem este
 * número, "−7 p.p." se lê como queda.
 *
 * ⚠️ `null` quando qualquer uma das duas pontas não tem média — comparar contra
 * um intervalo incompleto daria uma variação que não corresponde a nada.
 */
export function variacaoDoRecorte(pontos: PontoDaSerie[]): number | null {
  if (pontos.length < MINIMO_PARA_SERIE) return null;
  const primeiro = pontos[0].mediaDoRecorte;
  const ultimo = pontos[pontos.length - 1].mediaDoRecorte;
  if (primeiro === null || ultimo === null) return null;
  return Math.round((ultimo - primeiro) * 100);
}

/**
 * "melhorou 7 p.p., e a turma caiu 10" — a frase que o gráfico não diz sozinho.
 *
 * ⚠️ **Nunca afirma "melhorou" ou "piorou" sem a referência.** Um aluno que
 * caiu 7 numa turma que caiu 10 subiu de posição, e dizer "piorou" ali seria
 * factualmente defensável e pedagogicamente errado.
 */
export function textoDaVariacao(pontos: PontoDaSerie[]): string | null {
  const aluno = variacaoDoAluno(pontos);
  if (aluno === null) return null;

  const sinal = (v: number) => (v < 0 ? `−${Math.abs(v)}` : `+${v}`);
  const doAluno = `${sinal(aluno)} p.p. entre a primeira e a última aplicação`;

  const recorte = variacaoDoRecorte(pontos);
  if (recorte === null) return doAluno;
  return `${doAluno} · a turma: ${sinal(recorte)} p.p.`;
}
