import type { IndicadoresDeTodos } from "@/services/indicadores";

export type SituacaoDoPeriodo = "futuro" | "vigente" | "vencido";

type Turma = IndicadoresDeTodos["turmas"][number];
type Periodo = IndicadoresDeTodos["comparativo"][number];

export type TurmaDaVisao = Turma & {
  situacao: SituacaoDoPeriodo;
  /** 0 = futuro, 1 = vigente, 2 = vencido (a ordem da tabela, D1). */
  grupo: number;
};

export type RecorteDasTurmas =
  | { tipo: "atuais" }
  | { tipo: "ultimo"; periodo: string }
  | { tipo: "todas" }
  | { tipo: "nenhuma" };

/** `YYYY-MM-DD` de hoje em São Paulo (o dia dos períodos). */
export const hojeEmSaoPaulo = (agora = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(agora);

export function situacaoDoPeriodo(
  p: Pick<Periodo, "inicio" | "fim">,
  hoje: string,
): SituacaoDoPeriodo {
  if (p.inicio > hoje) return "futuro";
  if (p.fim < hoje) return "vencido";
  return "vigente";
}

const GRUPO: Record<SituacaoDoPeriodo, number> = {
  futuro: 0,
  vigente: 1,
  vencido: 2,
};

/**
 * As turmas da tabela na visão de todos os períodos (tickets/047):
 * - D1: futuros, depois vigentes;
 * - D2: vencidos só com `mostrarEncerrados`;
 * - D3: nada futuro nem vigente (fim do ano) → só o último período vencido,
 *   nunca todas as antigas.
 */
export function turmasDaVisao(
  turmas: Turma[],
  periodos: Periodo[],
  hoje: string,
  mostrarEncerrados: boolean,
): {
  turmas: TurmaDaVisao[];
  recorte: RecorteDasTurmas;
  temEncerradasEscondidas: boolean;
} {
  const situacao = new Map(
    periodos.map((p) => [p.periodoId, situacaoDoPeriodo(p, hoje)]),
  );
  const todas: TurmaDaVisao[] = turmas.map((t) => {
    const s = situacao.get(t.periodoId) ?? "vencido";
    return { ...t, situacao: s, grupo: GRUPO[s] };
  });
  if (todas.length === 0) {
    return {
      turmas: [],
      recorte: { tipo: "nenhuma" },
      temEncerradasEscondidas: false,
    };
  }

  const atuais = todas.filter((t) => t.situacao !== "vencido");
  const vencidas = todas.filter((t) => t.situacao === "vencido");

  if (mostrarEncerrados) {
    return {
      turmas: todas,
      recorte: { tipo: "todas" },
      temEncerradasEscondidas: false,
    };
  }
  if (atuais.length > 0) {
    return {
      turmas: atuais,
      recorte: { tipo: "atuais" },
      temEncerradasEscondidas: vencidas.length > 0,
    };
  }
  // D3 — o último período vencido (o de fim mais recente)
  const ultimo = [...periodos]
    .filter((p) => situacao.get(p.periodoId) === "vencido")
    .sort((a, b) => b.fim.localeCompare(a.fim))[0];
  const doUltimo = vencidas.filter((t) => t.periodoId === ultimo?.periodoId);
  return {
    turmas: doUltimo,
    recorte: { tipo: "ultimo", periodo: ultimo?.nome ?? "" },
    temEncerradasEscondidas: doUltimo.length < vencidas.length,
  };
}

/** Subtítulo da tabela (D4). */
export function subtituloDoRecorte(r: RecorteDasTurmas): string {
  switch (r.tipo) {
    case "atuais":
      return "Turmas dos períodos futuros e em andamento · da maior para a menor evasão";
    case "ultimo":
      return `Turmas do último período (${r.periodo}) · da maior para a menor evasão`;
    default:
      return "Todas as turmas · da maior para a menor evasão";
  }
}

/** O período embaixo do nome, com a situação quando não é vigente. */
export function rotuloDoPeriodoDaTurma(
  t: Pick<TurmaDaVisao, "periodoNome" | "situacao">,
  inicio?: string,
): string {
  if (t.situacao === "futuro" && inicio) {
    const [, m, d] = inicio.split("-");
    return `${t.periodoNome} · começa em ${d}/${m}`;
  }
  if (t.situacao === "vencido") return `${t.periodoNome} · encerrado`;
  return t.periodoNome;
}
