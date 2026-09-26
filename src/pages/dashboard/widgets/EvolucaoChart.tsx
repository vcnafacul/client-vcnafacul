import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DASH, SIMULADO } from '@/routes/path';
import { Panel, EmptyState } from '../components/Panel';
import { Segmented } from '../components/Segmented';
import { ChartTooltip } from '../components/ChartTooltip';
import { useDashData } from '../data';
import { performancePoints } from '../format';
import { chartColors } from '../theme';

const ranges = [
  { value: '5', label: '5 últimos' },
  { value: '10', label: '10 últimos' },
  { value: 'all', label: 'Todos' },
] as const;

type Range = (typeof ranges)[number]['value'];

export function EvolucaoChart() {
  const { data, isLoading, error, retry } = useDashData('performance');
  const [range, setRange] = useState<Range>('10');

  const all = performancePoints(data?.historicos ?? []);
  const points = range === 'all' ? all : all.slice(-Number(range));

  return (
    <Panel
      title="Evolução nos simulados"
      subtitle="Aproveitamento em cada simulado concluído"
      isLoading={isLoading}
      error={error}
      retry={retry}
      action={
        all.length > 5 && (
          <Segmented
            label="Quantidade de simulados"
            options={ranges}
            value={range}
            onChange={setRange}
          />
        )
      }
    >
      {points.length < 2 ? (
        <EmptyState
          action={
            <Link
              to={`${DASH}/${SIMULADO}`}
              className="text-sm font-medium text-marine underline-offset-2 hover:underline"
            >
              Fazer um simulado →
            </Link>
          }
        >
          {points.length === 0
            ? 'Quando você concluir simulados, sua evolução aparece aqui.'
            : 'Conclua mais um simulado para ver sua evolução.'}
        </EmptyState>
      ) : (
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={points}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="evolucao-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColors.primary} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={chartColors.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={chartColors.grid} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: chartColors.axis, fontSize: 12 }}
                tickMargin={8}
                padding={{ left: 12, right: 12 }}
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
                  const point = payload?.[0]?.payload as
                    | (typeof points)[number]
                    | undefined;
                  if (!active || !point) return null;
                  return (
                    <ChartTooltip title={point.name} caption={point.label}>
                      <strong className="tabular-nums lining-nums">{point.value}%</strong>{' '}
                      de aproveitamento
                    </ChartTooltip>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartColors.primary}
                strokeWidth={2}
                fill="url(#evolucao-fill)"
                dot={{ r: 3, fill: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
}
