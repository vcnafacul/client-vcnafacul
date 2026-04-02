import { useAuthStore } from '@/store/auth';
import { getCollaboratorDashboard, CollaboratorDashboard } from '@/services/dashboard';
import { useWidgetData } from '../hooks/useWidgetData';
import { WidgetShell } from './WidgetShell';
import { WidgetIcon } from './WidgetIcon';
import { Handshake } from 'lucide-react';

export function CursinhoCollabWidget() {
  const token = useAuthStore((s) => s.data.token);
  const { data, isLoading, error, retry } =
    useWidgetData<CollaboratorDashboard>(() => getCollaboratorDashboard(token));

  return (
    <WidgetShell
      title="Colaborador"
      widgetId="cursinho-collab"
      icon={<WidgetIcon icon={Handshake} />}
      isLoading={isLoading}
      error={error}
      retry={retry}
      className="min-h-[180px]"
    >
      {data && (
        <div className="flex min-h-[120px] flex-col">
          <div className="flex items-center gap-2.5 py-2">
            {data.cursinho.logo ? (
              <img
                src={data.cursinho.logo}
                alt={data.cursinho.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-marine/10 to-green/15 text-[13px] font-bold text-marine">
                {data.cursinho.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-medium text-gray-700">
                {data.cursinho.name}
              </span>
              <span className="rounded-full bg-green/15 px-2 py-0.5 text-[10px] font-semibold text-[#0d7a63]">
                Ativo
              </span>
            </div>
          </div>

          <div className="h-px bg-black/[0.06] my-1" />

          {data.frentes.length > 0 && (
            <div className="flex flex-1 flex-col justify-center py-2">
              <p className="mb-2 text-[10px] uppercase tracking-wide text-gray-400">
                Frentes que leciono
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.frentes.map((f) => (
                  <span
                    key={f.id}
                    className="rounded-full bg-marine/[0.08] px-2.5 py-0.5 text-[11px] font-medium text-marine"
                  >
                    {f.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </WidgetShell>
  );
}
