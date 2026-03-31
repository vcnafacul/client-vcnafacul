import { useAuthStore } from '@/store/auth';
import { getSimuladoByPeriod, SimuladoByPeriod } from '@/services/dashboard';
import { useWidgetData } from '../hooks/useWidgetData';
import { WidgetShell } from './WidgetShell';
import { BarChart } from '@mui/x-charts/BarChart';

export function DesempenhoWidget() {
  const token = useAuthStore((s) => s.data.token);
  const { data, isLoading, error, retry } = useWidgetData<SimuladoByPeriod[]>(
    () => getSimuladoByPeriod(token),
  );

  return (
    <WidgetShell
      title="Evolução em Simulados"
      isLoading={isLoading}
      error={error}
      retry={retry}
    >
      {data && data.length > 0 ? (
        <BarChart
          xAxis={[
            {
              scaleType: 'band',
              data: data.map((d) => d.period),
            },
          ]}
          series={[
            {
              data: data.map((d) => d.completos),
              label: 'Completos',
            },
            {
              data: data.map((d) => d.incompletos),
              label: 'Incompletos',
            },
          ]}
          height={200}
          slotProps={{ legend: { hidden: true } }}
          colors={['#0B2747', '#37D6B5']}
        />
      ) : (
        <p className="py-4 text-center text-sm text-gray-400">
          Nenhum dado disponível ainda
        </p>
      )}
    </WidgetShell>
  );
}
