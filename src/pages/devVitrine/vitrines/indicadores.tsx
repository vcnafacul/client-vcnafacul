import { TelaDosIndicadores } from "@/pages/indicadoresCursinho";
import { RotaFalsa } from "../fetchFalso";
import { Vitrine } from "../tipos";

/**
 * A tela de Indicadores na visão do admin (tickets/045). Para o estado
 * "outro cursinho", abrir com `?cursinho=alfa` na URL da vitrine.
 */
const periodo = {
  id: "p1",
  nome: "Extensivo 2026",
  ano: 2026,
  inicio: "2026-02-02",
  fim: "2026-12-11",
  emAndamento: true,
};
const metricas = (alunos: number) => ({
  alunos,
  ativos: Math.round(alunos * 0.82),
  cancelados: Math.round(alunos * 0.12),
  desistenciaInicial: Math.round(alunos * 0.06),
  aulasRegistradas: 64,
  chamadasAluno: alunos * 60,
  presencas: Math.round(alunos * 60 * 0.78),
  faltasJustificadas: alunos * 2,
  sumindo: 3,
  canceladosPorMotivo: { Trabalho: 6, "Mudança de cidade": 2, Outros: 3 },
});
const dias = Array.from({ length: 8 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 7, 3 + i * 7));
  return { dia: d.toISOString().slice(0, 10), metricas: metricas(90 + i) };
});
const indicadores = {
  periodo,
  atualizadoEm: new Date().toISOString(),
  cursinho: metricas(97),
  turmas: [
    { id: "t1", nome: "Manhã", metricas: metricas(52) },
    { id: "t2", nome: "Noite", metricas: metricas(45) },
  ],
  serie: dias,
};
const antigo = {
  id: "p0",
  nome: "Extensivo 2025",
  ano: 2025,
  inicio: "2025-02-03",
  fim: "2025-12-12",
  emAndamento: false,
};
/** Soma chave a chave, como o `somarMetricas` da api. */
function somar(lista: Record<string, unknown>[]) {
  const soma: Record<string, unknown> = {};
  for (const m of lista)
    for (const [k, v] of Object.entries(m)) {
      if (typeof v === "number") soma[k] = ((soma[k] as number) ?? 0) + v;
      else if (v && typeof v === "object") {
        const mapa = { ...((soma[k] as Record<string, number>) ?? {}) };
        for (const [kk, n] of Object.entries(v as Record<string, number>))
          mapa[kk] = (mapa[kk] ?? 0) + n;
        soma[k] = mapa;
      }
    }
  return soma;
}

/** tickets/046 — a visão de todos os períodos. */
const todos = (comAberto: boolean) => {
  const encerrado = { ...metricas(84), ativos: 70 };
  const periodosDaVisao = comAberto ? [antigo, periodo] : [antigo];
  const doPeriodo = (p: typeof periodo) =>
    p.id === "p0" ? encerrado : metricas(97);
  return {
    todos: true,
    periodos: periodosDaVisao,
    atualizadoEm: new Date().toISOString(),
    cursinho: somar(periodosDaVisao.map(doPeriodo)),
    emAndamento: comAberto ? metricas(97) : null,
    turmas: [
      { id: "a1", nome: "Manhã", periodoId: "p0", periodoNome: "Extensivo 2025", metricas: metricas(44) },
      { id: "a2", nome: "Noite", periodoId: "p0", periodoNome: "Extensivo 2025", metricas: metricas(40) },
      ...(comAberto
        ? [
            { id: "t1", nome: "Manhã", periodoId: "p1", periodoNome: "Extensivo 2026", metricas: metricas(52) },
            { id: "t2", nome: "Noite", periodoId: "p1", periodoNome: "Extensivo 2026", metricas: metricas(45) },
          ]
        : []),
    ],
    comparativo: periodosDaVisao.map((p) => ({
      periodoId: p.id,
      nome: p.nome,
      inicio: p.inicio,
      fim: p.fim,
      emAndamento: p.emAndamento,
      metricas: doPeriodo(p),
    })),
  };
};

const cursinhos = [
  { id: "alfa", name: "Cursinho Alfa", logoUrl: "" },
  { id: "saojose", name: "Pré-Vestibular Comunitário São José dos Campos", logoUrl: "" },
];

const rotas = (
  opcoes: { semCursinhoProprio?: boolean; semAberto?: boolean } = {},
): RotaFalsa[] => [
  { caminho: /\/partner-prep-course\/logos$/, resposta: { corpo: cursinhos } },
  {
    caminho: /\/indicadores\/periodos$/,
    resposta: opcoes.semCursinhoProprio
      ? { status: 404, corpo: { message: "Cursinho não encontrado" } }
      : {
          corpo: {
            periodos: opcoes.semAberto ? [antigo] : [periodo, antigo],
            turmasSemPeriodo: 0,
          },
        },
  },
  { caminho: /\/indicadores\/cursinho\/[^/]+\/periodos$/, resposta: { corpo: { periodos: [periodo], turmasSemPeriodo: 1 } } },
  {
    caminho: /\/indicadores(\/cursinho\/[^/]+)?$/,
    // sem periodoId: a visão de todos (046)
    resposta: (url) =>
      url.searchParams.get("periodoId")
        ? { corpo: indicadores }
        : { corpo: todos(!opcoes.semAberto) },
  },
  { caminho: /\/desempenho$/, resposta: { corpo: { aplicacoes: [], porTurma: [], porMes: [] } } },
  { caminho: /\/sumindo$/, resposta: { corpo: [] } },
];

export const vitrineIndicadoresAdmin: Vitrine = {
  slug: "indicadores-admin",
  titulo: "Indicadores – visão do admin",
  arquivo: "src/pages/indicadoresCursinho/index.tsx",
  estados: [
    { slug: "proprio", titulo: "Admin no próprio cursinho", rotas: rotas(), render: () => <TelaDosIndicadores podeVerOutros /> },
    { slug: "admin-sem-cursinho", titulo: "Admin sem cursinho", rotas: rotas({ semCursinhoProprio: true }), render: () => <TelaDosIndicadores podeVerOutros /> },
    { slug: "colaborador", titulo: "Colaborador comum", rotas: rotas(), render: () => <TelaDosIndicadores podeVerOutros={false} /> },
    { slug: "nenhum-em-andamento", titulo: "Todos, nenhum em andamento", rotas: rotas({ semAberto: true }), render: () => <TelaDosIndicadores podeVerOutros={false} /> },
  ],
};
