import { useAuthStore } from '@/store/auth';
import { getStudentDashboard, StudentDashboard } from '@/services/dashboard';
import { useWidgetData } from '../hooks/useWidgetData';
import { WidgetShell } from './WidgetShell';
import { WidgetIcon } from './WidgetIcon';
import { School } from 'lucide-react';

function FrequencyGauge({ percentual }: { percentual: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentual / 100) * circumference;
  const color =
    percentual >= 75 ? '#37D6B5' : percentual >= 50 ? '#FF7600' : '#F43535';

  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke="rgba(0,0,0,0.06)"
        strokeWidth="6"
      />
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
      />
      <text
        x="36"
        y="40"
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        fill="#0B2747"
      >
        {percentual}%
      </text>
    </svg>
  );
}

function StudentCardContent({ item }: { item: StudentDashboard }) {
  return (
    <div className="flex min-h-[140px] flex-col">
      <div className="mb-1">
        <p className="text-[13px] font-medium text-gray-700">
          {item.cursinho.name}
        </p>
        {item.matricula && (
          <p className="text-[11px] text-gray-400">
            Mat. <strong className="text-gray-700">{item.matricula}</strong>
          </p>
        )}
        {(item.turma || item.periodo) && (
          <p className="text-[11px] text-gray-400">
            {[item.turma, item.periodo].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      <div className="mt-auto flex items-end justify-between pt-2">
        <div className="flex gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-green">
              {item.frequencia.presencas}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-gray-400">
              Presenças
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-500">
              {item.frequencia.faltas}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-gray-400">
              Faltas
            </div>
          </div>
        </div>
        <FrequencyGauge percentual={item.frequencia.percentual} />
      </div>
    </div>
  );
}

export function CursinhoStudentWidget() {
  const token = useAuthStore((s) => s.data.token);
  const { data, isLoading, error, retry } =
    useWidgetData<StudentDashboard[]>(() => getStudentDashboard(token));

  const latest = data?.length ? data[data.length - 1] : null;

  return (
    <WidgetShell
      title="Meu Cursinho"
      widgetId="cursinho-student"
      icon={<WidgetIcon icon={School} />}
      isLoading={isLoading}
      error={error}
      retry={retry}
    >
      {latest ? (
        <StudentCardContent item={latest} />
      ) : (
        <p className="py-4 text-center text-sm text-gray-400">
          Nenhuma matrícula ativa
        </p>
      )}
    </WidgetShell>
  );
}
