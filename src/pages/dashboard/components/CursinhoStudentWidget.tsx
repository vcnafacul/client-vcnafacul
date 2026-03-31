import { useAuthStore } from '@/store/auth';
import { getStudentDashboard, StudentDashboard } from '@/services/dashboard';
import { useWidgetData } from '../hooks/useWidgetData';
import { WidgetShell } from './WidgetShell';

function FrequencyGauge({ percentual }: { percentual: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentual / 100) * circumference;
  const color = percentual >= 75 ? '#37D6B5' : percentual >= 50 ? '#FF7600' : '#F43535';

  return (
    <div className="flex flex-col items-center">
      <svg width="88" height="88" className="-rotate-90">
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="mt-1 text-lg font-bold" style={{ color }}>
        {percentual}%
      </span>
    </div>
  );
}

function StudentCard({ item }: { item: StudentDashboard }) {
  return (
    <div className="flex flex-1 gap-4 rounded-lg border p-3">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          {item.cursinho.logo ? (
            <img
              src={item.cursinho.logo}
              alt={item.cursinho.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-500">
              {item.cursinho.name.charAt(0)}
            </div>
          )}
          <span className="font-medium text-sm">{item.cursinho.name}</span>
        </div>
        {item.matricula && (
          <p className="text-xs text-gray-500">
            Matrícula: <span className="font-medium">{item.matricula}</span>
          </p>
        )}
        {item.turma && (
          <p className="text-xs text-gray-500">
            Turma: <span className="font-medium">{item.turma}</span>
          </p>
        )}
        {item.periodo && (
          <p className="text-xs text-gray-500">
            Período: <span className="font-medium">{item.periodo}</span>
          </p>
        )}
        <div className="flex gap-3 text-xs text-gray-500 pt-1">
          <span>Presenças: <strong>{item.frequencia.presencas}</strong></span>
          <span>Faltas: <strong>{item.frequencia.faltas}</strong></span>
        </div>
      </div>
      <FrequencyGauge percentual={item.frequencia.percentual} />
    </div>
  );
}

export function CursinhoStudentWidget() {
  const token = useAuthStore((s) => s.data.token);
  const { data, isLoading, error, retry } =
    useWidgetData<StudentDashboard[]>(() => getStudentDashboard(token));

  return (
    <WidgetShell
      title="Meus Cursinhos"
      isLoading={isLoading}
      error={error}
      retry={retry}
    >
      {data && data.length > 0 ? (
        <div className="flex flex-col sm:flex-row sm:items-stretch gap-3">
          {data.map((item, i) => (
            <StudentCard key={item.matricula ?? i} item={item} />
          ))}
        </div>
      ) : (
        <p className="py-4 text-center text-sm text-gray-400">
          Nenhuma matrícula ativa
        </p>
      )}
    </WidgetShell>
  );
}
