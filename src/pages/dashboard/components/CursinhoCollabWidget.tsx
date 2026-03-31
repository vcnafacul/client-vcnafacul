import { useAuthStore } from '@/store/auth';
import { getCollaboratorDashboard, CollaboratorDashboard } from '@/services/dashboard';
import { useWidgetData } from '../hooks/useWidgetData';
import { WidgetShell } from './WidgetShell';

export function CursinhoCollabWidget() {
  const token = useAuthStore((s) => s.data.token);
  const { data, isLoading, error, retry } =
    useWidgetData<CollaboratorDashboard>(() => getCollaboratorDashboard(token));

  return (
    <WidgetShell
      title="Meu Cursinho"
      isLoading={isLoading}
      error={error}
      retry={retry}
    >
      {data && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {data.cursinho.logo ? (
              <img
                src={data.cursinho.logo}
                alt={data.cursinho.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-500">
                {data.cursinho.name.charAt(0)}
              </div>
            )}
            <span className="font-medium text-sm">{data.cursinho.name}</span>
          </div>
          <p className="text-xs text-green font-medium">Colaborador ativo</p>
          {data.frentes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {data.frentes.map((f) => (
                <span
                  key={f.id}
                  className="rounded-full bg-marine/10 px-2.5 py-0.5 text-xs font-medium text-marine"
                >
                  {f.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </WidgetShell>
  );
}
