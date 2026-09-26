import { Link } from 'react-router-dom';
import { ClipboardList, PenTool } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { DASH, ESSAY_WRITE, SIMULADO } from '@/routes/path';

function greeting(hour: number) {
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function Greeting() {
  const { user, profiles } = useAuthStore((s) => s.data);
  const name =
    user.useSocialName && user.socialName ? user.socialName : user.firstName;
  const now = new Date();
  const today = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const isStudent = profiles.includes('student');

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm text-slate-500 first-letter:uppercase">{today}</p>
        <h1 className="mt-0.5 text-2xl font-bold text-marine">
          {greeting(now.getHours())}, {name}
        </h1>
      </div>
      <div className="flex flex-wrap gap-2">
        {isStudent && (
          <Link
            to={`${DASH}/${ESSAY_WRITE}`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-marine transition-colors hover:border-marine/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marine/40"
          >
            <PenTool className="h-4 w-4" aria-hidden />
            Escrever redação
          </Link>
        )}
        <Link
          to={`${DASH}/${SIMULADO}`}
          className="inline-flex items-center gap-2 rounded-lg bg-marine px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marine/40 focus-visible:ring-offset-2"
        >
          <ClipboardList className="h-4 w-4" aria-hidden />
          Fazer simulado
        </Link>
      </div>
    </div>
  );
}
