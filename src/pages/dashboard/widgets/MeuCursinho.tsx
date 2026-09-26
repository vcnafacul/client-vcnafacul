import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from 'recharts';
import { Panel, EmptyState } from '../components/Panel';
import { useDashData } from '../data';
import { chartColors } from '../theme';

function frequencyColor(percentual: number) {
  if (percentual >= 75) return chartColors.accent;
  if (percentual >= 50) return chartColors.warn;
  return chartColors.danger;
}

export function MeuCursinho() {
  const { data, isLoading, error, retry } = useDashData('student');
  const latest = data?.length ? data[data.length - 1] : null;

  return (
    <Panel
      title="Meu cursinho"
      subtitle={latest?.cursinho.name}
      isLoading={isLoading}
      error={error}
      retry={retry}
    >
      {!latest ? (
        <EmptyState>Você não tem matrícula ativa em cursinho.</EmptyState>
      ) : (
        <div>
          <div className="relative mx-auto h-[180px] w-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                data={[{ value: latest.frequencia.percentual }]}
                startAngle={90}
                endAngle={-270}
                innerRadius="78%"
                outerRadius="100%"
                barSize={14}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar
                  dataKey="value"
                  cornerRadius={8}
                  background={{ fill: chartColors.track }}
                  fill={frequencyColor(latest.frequencia.percentual)}
                  isAnimationActive
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold tabular-nums lining-nums text-marine">
                {latest.frequencia.percentual}%
              </span>
              <span className="text-xs text-slate-500">de frequência</span>
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-slate-50 py-2.5">
              <dt className="text-xs text-slate-500">Presenças</dt>
              <dd className="text-lg font-bold tabular-nums lining-nums text-[#0d7a63]">
                {latest.frequencia.presencas}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 py-2.5">
              <dt className="text-xs text-slate-500">Faltas</dt>
              <dd className="text-lg font-bold tabular-nums lining-nums text-red">
                {latest.frequencia.faltas}
              </dd>
            </div>
          </dl>

          {(latest.matricula || latest.turma || latest.periodo) && (
            <p className="mt-4 text-center text-xs text-slate-500">
              {[
                latest.matricula && `Matrícula ${latest.matricula}`,
                latest.turma,
                latest.periodo,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
        </div>
      )}
    </Panel>
  );
}
