import { Link } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { InfoDaMetrica } from "@/components/indicadores/InfoDaMetrica";
import { ChartTooltip } from "@/pages/dashboard/components/ChartTooltip";
import { EmptyState, Panel } from "@/pages/dashboard/components/Panel";
import { chartColors } from "@/pages/dashboard/theme";
import { DASH, PARTNER_PROVAS } from "@/routes/path";
import type { Desempenho } from "@/services/indicadores";
import { explicacoes } from "./explicacoes";
import { porcentagem } from "./formato";

const MESES = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];
const rotuloDoMes = (mes: string) =>
  `${MESES[Number(mes.slice(5, 7)) - 1]}/${mes.slice(2, 4)}`;
const diaCurto = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/**
 * Área "Desempenho" (tickets/033, card 09): a curva dos simulados aplicados
 * pelo cursinho e, como apoio, simulados e redação por mês.
 */
export function AreaDesempenho({
  dados,
  carregando,
  erro,
  carregar,
}: {
  dados: Desempenho | null;
  carregando: boolean;
  erro: boolean;
  carregar: () => void;
}) {
  const pontos = (dados?.aplicacoes ?? [])
    .filter((a) => a.media !== null)
    .map((a) => ({ ...a, rotulo: a.em ? diaCurto(a.em) : a.nome }));

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Panel
        title={
          <span className="inline-flex items-center gap-1">
            Simulados do cursinho
            <InfoDaMetrica
              metrica="Simulados do cursinho"
              explicacao={explicacoes.simuladosDoCursinho}
            />
          </span>
        }
        subtitle="Nota média em cada simulado aplicado com cartão-resposta"
        isLoading={carregando}
        error={erro ? "erro" : null}
        retry={carregar}
      >
        {pontos.length < 2 ? (
          <EmptyState
            action={
              <Link
                to={`${DASH}/${PARTNER_PROVAS}`}
                className="text-sm font-medium text-marine underline-offset-2 hover:underline"
              >
                Ir para Provas →
              </Link>
            }
          >
            {pontos.length === 0
              ? "Quando o cursinho aplicar simulados com cartão-resposta, a evolução da turma aparece aqui."
              : `Até agora, um simulado aplicado: ${pontos[0].nome}, com média de ${porcentagem(pontos[0].media)}. A curva aparece a partir do segundo.`}
          </EmptyState>
        ) : (
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={pontos}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke={chartColors.grid} />
                <XAxis
                  dataKey="rotulo"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: chartColors.axis, fontSize: 12 }}
                  tickMargin={8}
                  minTickGap={16}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: chartColors.axis, fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ stroke: chartColors.grid }}
                  content={({ active, payload }) => {
                    const p = payload?.[0]?.payload as
                      | (typeof pontos)[number]
                      | undefined;
                    if (!active || !p) return null;
                    return (
                      <ChartTooltip
                        title={p.nome}
                        caption={`${p.participantes} alunos fizeram`}
                      >
                        <strong className="tabular-nums lining-nums">
                          {porcentagem(p.media)}
                        </strong>{" "}
                        de média
                      </ChartTooltip>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="media"
                  stroke={chartColors.primary}
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#fff", strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>

      <Panel
        title={
          <span className="inline-flex items-center gap-1">
            Simulados e redação por mês
            <InfoDaMetrica
              metrica="Simulados e redação por mês"
              explicacao={explicacoes.porMes}
            />
          </span>
        }
        subtitle="Quantos participaram e a média de quem fez"
        isLoading={carregando}
        error={erro ? "erro" : null}
        retry={carregar}
      >
        {!dados || dados.porMes.length === 0 ? (
          <EmptyState>
            Nenhum simulado concluído nem redação corrigida neste período.
          </EmptyState>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-2 font-medium">Mês</th>
                <th className="px-2 py-2 text-right font-medium">Simulados</th>
                <th className="py-2 pl-2 text-right font-medium">Redação</th>
              </tr>
            </thead>
            <tbody>
              {dados.porMes.map((m) => (
                <tr key={m.mes} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 pr-2 font-medium text-slate-700">
                    {rotuloDoMes(m.mes)}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums lining-nums text-slate-600">
                    {m.simulados.participantes
                      ? `${m.simulados.participantes} alunos · ${porcentagem(m.simulados.media)}`
                      : "—"}
                  </td>
                  <td className="py-2 pl-2 text-right tabular-nums lining-nums text-slate-600">
                    {m.redacao.corrigidas
                      ? `${m.redacao.corrigidas} corrigidas · nota ${m.redacao.media}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}
