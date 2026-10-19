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
const cursinhos = [
  { id: "alfa", name: "Cursinho Alfa", logoUrl: "" },
  { id: "saojose", name: "Pré-Vestibular Comunitário São José dos Campos", logoUrl: "" },
];

const rotas = (opcoes: { semCursinhoProprio?: boolean } = {}): RotaFalsa[] => [
  { caminho: /\/partner-prep-course\/logos$/, resposta: { corpo: cursinhos } },
  {
    caminho: /\/indicadores\/periodos$/,
    resposta: opcoes.semCursinhoProprio
      ? { status: 404, corpo: { message: "Cursinho não encontrado" } }
      : { corpo: { periodos: [periodo], turmasSemPeriodo: 0 } },
  },
  { caminho: /\/indicadores\/cursinho\/[^/]+\/periodos$/, resposta: { corpo: { periodos: [periodo], turmasSemPeriodo: 1 } } },
  { caminho: /\/indicadores(\/cursinho\/[^/]+)?$/, resposta: { corpo: indicadores } },
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
  ],
};
