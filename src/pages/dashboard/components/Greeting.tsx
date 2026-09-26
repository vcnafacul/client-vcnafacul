import { Link } from 'react-router-dom';
import { ClipboardList, PenTool } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { DASH, ESSAY_WRITE, SIMULADO } from '@/routes/path';
import { cn } from '@/lib/utils';
import { View } from '../registry';
import { Segmented } from './Segmented';

const viewOptions: ReadonlyArray<{ value: View; label: string }> = [
  { value: 'atuacao', label: 'Colaborador' },
  { value: 'estudo', label: 'Estudante' },
];

function greeting(hour: number) {
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

interface GreetingProps {
  view: View;
  views: View[];
  onViewChange: (view: View) => void;
}

export function Greeting({ view, views, onViewChange }: GreetingProps) {
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
      {/* Altura dos botões: no desktop a linha não cresce quando eles aparecem. */}
      <div className="flex flex-wrap items-center gap-2 sm:min-h-[38px]">
        {view === 'estudo' && (
          <>
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
          </>
        )}
        {/*
          Só existe escolha para quem tem as duas visões. Fica por último para
          ficar ancorado à direita: os botões de estudante que aparecem ao
          trocar de visão surgem à esquerda dele, sem empurrá-lo. No celular a
          linha é alinhada à esquerda, então ali o âncora é o primeiro item.
        */}
        {views.length > 1 && (
          <div
            className={cn(
              'flex items-center gap-2 max-sm:order-first',
              // Separa "Ver como" dos botões, senão lê como parte deles.
              view === 'estudo' && 'sm:ml-1 sm:border-l sm:border-slate-200 sm:pl-3',
            )}
          >
            <span className="text-xs text-slate-500" aria-hidden>
              Ver como
            </span>
            <Segmented
              label="Visão da dashboard"
              options={viewOptions}
              value={view}
              onChange={onViewChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
