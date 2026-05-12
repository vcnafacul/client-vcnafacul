import { useAuthStore } from '@/store/auth';
import {
  getStudentsServed,
  StudentsServedResponse,
} from '@/services/dashboard';
import { useWidgetData } from '../hooks/useWidgetData';
import { WidgetShell } from './WidgetShell';
import { WidgetIcon } from './WidgetIcon';
import { GraduationCap } from 'lucide-react';

export function EstudantesAtendidosWidget() {
  const token = useAuthStore((s) => s.data.token);
  const { data, isLoading, error, retry } =
    useWidgetData<StudentsServedResponse>(() => getStudentsServed(token));

  return (
    <WidgetShell
      title="Estudantes Atendidos"
      widgetId="estudantes-atendidos"
      icon={<WidgetIcon icon={GraduationCap} />}
      isLoading={isLoading}
      error={error}
      retry={retry}
    >
      {data && (
        <div>
          <div className="mb-1 flex items-baseline gap-1.5">
            <span className="text-[26px] font-bold leading-none text-marine">
              {data.total.toLocaleString('pt-BR')}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-gray-400">
              estudantes
            </span>
          </div>
          <div className="my-2 h-px bg-black/[0.06]" />
          <p className="text-[12px] text-gray-500">
            Estudantes que foram efetivamente matriculados no cursinho
          </p>
        </div>
      )}
    </WidgetShell>
  );
}
