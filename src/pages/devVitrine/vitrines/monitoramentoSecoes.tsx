import { Period } from "@/enums/analytics/period";
import AnalyticsPrepCourse from "@/pages/analytics/prepCourse";
import AnalyticsSimulado from "@/pages/analytics/simulado";
import AnalyticsUsers from "@/pages/analytics/users";
import { RotaFalsa } from "../fetchFalso";
import { Vitrine } from "../tipos";

/** As seções do Monitoramento com um cursinho escolhido (tickets/044, card 07). */
const meses = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05"];
const porPeriodo = meses.map((period, i) => ({
  period,
  total: 10 + i * 4,
  completos: 8 + i * 3,
  incompletos: 2 + i,
}));
const porTipo = [
  { tipo: "Enem Dia 1", summary: meses.map((period, i) => ({ period, total: 6 + i * 2 })) },
  { tipo: "Simulado mensal", summary: meses.map((period, i) => ({ period, total: 4 + i })) },
];

const rotasDoCursinho = (simuladosFora = false): RotaFalsa[] => [
  { caminho: /\/monitoramento\/usuarios-por-perfil$/, resposta: { corpo: [
    { name: "Professor", total: 14 }, { name: "Coordenação", total: 3 }, { name: "Monitor", total: 6 },
  ] } },
  { caminho: /\/monitoramento\/ultimo-acesso$/, resposta: { corpo: meses.map((period, i) => ({
    period, colaboradores: 8 + i, estudantes: 40 + i * 12,
  })) } },
  { caminho: /\/monitoramento\/resumo$/, resposta: { corpo: {
    processosNaoTeste: 4, processosTotal: 6, inscricoesNaoTeste: 312, matriculasNaoTeste: 87,
  } } },
  { caminho: /\/monitoramento\/inscricoes-por-periodo$/, resposta: { corpo: meses.map((period, i) => ({
    period, totalInscriptions: 20 + i * 15, totalEnrolments: 5 + i * 3,
    cumulativeInscriptionsTotal: 0, cumulativeEnrolmentsTotal: 0,
  })) } },
  { caminho: /\/monitoramento\/simulados\/por-periodo$/, resposta: simuladosFora ? { status: 502, corpo: { message: "x" } } : { corpo: porPeriodo } },
  { caminho: /\/monitoramento\/simulados\/por-tipo$/, resposta: simuladosFora ? { status: 502, corpo: { message: "x" } } : { corpo: porTipo } },
];

const secoes = () => (
  <div className="bg-gray-50">
    <AnalyticsUsers period={Period.month} cursinhoId="c1" cursinhoNome="Cursinho Alfa" />
    <AnalyticsSimulado period={Period.month} cursinhoId="c1" cursinhoNome="Cursinho Alfa" />
    <AnalyticsPrepCourse period={Period.month} cursinhoId="c1" cursinhoNome="Cursinho Alfa" />
  </div>
);

export const vitrineMonitoramentoSecoes: Vitrine = {
  slug: "monitoramento-secoes",
  titulo: "Monitoramento – seções do cursinho",
  arquivo: "src/pages/analytics/index.tsx",
  estados: [
    { slug: "cursinho", titulo: "Cursinho", rotas: rotasDoCursinho(), render: secoes },
    { slug: "indisponivel", titulo: "Simulados indisponível", rotas: rotasDoCursinho(true), render: secoes },
  ],
};
