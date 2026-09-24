import type {
  LinhaDoRelatorio,
  RelatorioDoSimulado,
} from "@/dtos/relatorioSimulado/relatorioSimulado";

/**
 * A comparação entre duas aplicações, aluno a aluno (card 31).
 *
 * ⚠️ **O degrau 2 do card 17 já responde "o Pedro melhorou?"** — a série dele,
 * com a linha da turma junto. O que falta é varrer a turma INTEIRA de uma vez:
 * hoje isso exige abrir 30 modais, um por aluno.
 *
 * ⚠️ **Nenhum agregado novo, nenhuma rota nova.** São duas chamadas ao
 * relatório que já existe. A regra que o card 17 estabeleceu continua valendo:
 * já são dois os lugares que calculam desempenho de turma (o relatório, sob
 * demanda, e o `user_group_aggregates`, mensal por cron), e um terceiro daria
 * três números diferentes para a mesma turma na mesma semana.
 */

export interface LinhaComparada {
  usuario: string;
  nome: string;
  matricula: string;
  /** Fração de 0 a 1. */
  antes: number;
  depois: number;
  /** A diferença em pontos percentuais, já arredondada. */
  delta: number;
}

export interface Comparacao {
  linhas: LinhaComparada[];
  /**
   * Quantos estudantes ficaram de fora por não terem leitura nas DUAS.
   *
   * ⚠️ **Contado, nunca listado** — mesma regra do `linhasSemEstudanteAtivo`. E
   * ele precisa aparecer na tela: sem o número, a comparação de 19 alunos numa
   * turma de 30 parece que perdeu gente.
   */
  foraDaIntersecao: number;
  /** A variação da média do recorte, na mesma base. */
  deltaDaMedia: number | null;
}

/**
 * ⚠️ **Só entra quem tem leitura concluída NAS DUAS.** Comparar a média de 27
 * alunos com a de 19 outros não é comparação — e o card é explícito: o recorte
 * tem de ser a interseção.
 *
 * ⚠️ E `status === "completed"` **com** nota numérica: o `marcarFalha` do ms não
 * limpa o `aproveitamento`, então uma linha `failed` carrega nota velha. É a
 * mesma dupla checagem que o resto da série faz.
 */
function comparavel(l: LinhaDoRelatorio): boolean {
  return l.status === "completed" && typeof l.aproveitamentoGeral === "number";
}

/**
 * A chave que identifica a pessoa entre as duas aplicações.
 *
 * ⚠️ **`usuario` sozinho NÃO é único** — a api monta as linhas de uma query sem
 * `DISTINCT`, e quem se matriculou por dois processos do mesmo cursinho vem duas
 * vezes. A tabela do relatório já usa `usuario:matricula` como `rowKey` pelo
 * mesmo motivo, e usar chave diferente aqui casaria as pessoas erradas.
 */
function chave(l: LinhaDoRelatorio): string {
  return `${l.usuario}:${l.matricula}`;
}

function media(linhas: LinhaComparada[], lado: "antes" | "depois"): number {
  return linhas.reduce((t, l) => t + l[lado], 0) / linhas.length;
}

/**
 * Compara duas aplicações, aluno a aluno.
 *
 * ⚠️ **A ordem dos argumentos é a ordem do tempo**, e quem chama é responsável
 * por ela: `antes` é a aplicação mais antiga. Inverter faria toda melhora virar
 * queda, sem nada na tela denunciando.
 */
export function compararAplicacoes(
  antes: RelatorioDoSimulado,
  depois: RelatorioDoSimulado,
): Comparacao {
  const doDepois = new Map(
    depois.linhas.filter(comparavel).map((l) => [chave(l), l]),
  );

  const linhas: LinhaComparada[] = [];
  for (const a of antes.linhas) {
    if (!comparavel(a)) continue;
    const d = doDepois.get(chave(a));
    if (d === undefined) continue;

    const notaAntes = a.aproveitamentoGeral as number;
    const notaDepois = d.aproveitamentoGeral as number;
    linhas.push({
      usuario: a.usuario,
      nome: a.nome,
      matricula: a.matricula,
      antes: notaAntes,
      depois: notaDepois,
      /*
        ⚠️ Arredonda DEPOIS de subtrair. Arredondar as duas notas antes e
        subtrair acumula dois erros de meio ponto, e um aluno que ficou igual
        pode sair com "+1 p.p." — mesma regra do `desvioEmPontos` do card 08.
      */
      delta: Math.round((notaDepois - notaAntes) * 100),
    });
  }

  /*
    ⚠️ **Quem ficou de fora são os DOIS lados**, sem repetir quem está nos dois.
    Contar só o lado de `antes` esconderia os alunos que só fizeram a segunda
    aplicação — que são exatamente os que entraram na turma no meio do caminho.
  */
  const dentro = new Set(linhas.map((l) => `${l.usuario}:${l.matricula}`));
  const todos = new Set(
    [...antes.linhas, ...depois.linhas].filter(comparavel).map(chave),
  );
  const foraDaIntersecao = todos.size - dentro.size;

  return {
    linhas,
    foraDaIntersecao,
    /*
      ⚠️ **A média é a da INTERSEÇÃO, não a do resumo de cada relatório.** O
      resumo de cada um inclui quem não fez a outra — e aí a "variação da turma"
      compararia dois grupos diferentes, que é justamente o erro que este card
      existe para não cometer.
    */
    deltaDaMedia:
      linhas.length === 0
        ? null
        : Math.round((media(linhas, "depois") - media(linhas, "antes")) * 100),
  };
}

/** "+14 p.p." / "−9 p.p." / "0 p.p." — com o sinal sempre explícito. */
export function formatarDelta(pontos: number): string {
  // ⚠️ Menos tipográfico (U+2212), como no resto da série.
  if (pontos < 0) return `−${Math.abs(pontos)} p.p.`;
  return pontos > 0 ? `+${pontos} p.p.` : "0 p.p.";
}

/**
 * ⚠️ **"Melhorou" é relativo à turma, não ao próprio aluno.** Um aluno que caiu
 * 7 numa turma que caiu 10 SUBIU de posição — e é a mesma leitura que o degrau 2
 * do card 17 já pratica no gráfico. Dizer "piorou" ali seria factualmente
 * defensável e pedagogicamente errado.
 *
 * `null` quando não há média para comparar.
 */
export function acimaDaTurma(
  delta: number,
  deltaDaMedia: number | null,
): boolean | null {
  if (deltaDaMedia === null) return null;
  return delta > deltaDaMedia;
}
