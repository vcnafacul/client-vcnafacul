import { useAuthStore } from '@/store/auth';
import { getOpenInscriptions, OpenInscription } from '@/services/dashboard';
import { useWidgetData } from '../hooks/useWidgetData';
import { WidgetShell } from './WidgetShell';
import { Link } from 'react-router-dom';
import { PARTNER_PREP, PARTNER_PREP_INSCRIPTION } from '@/routes/path';
// PARTNER_PREP = "cursinho/", PARTNER_PREP_INSCRIPTION = "inscricao"

export function ProcessosSeletivosWidget() {
  const token = useAuthStore((s) => s.data.token);
  const { data, isLoading, error, retry } = useWidgetData<OpenInscription[]>(
    () => getOpenInscriptions(token),
  );

  return (
    <WidgetShell
      title="Processos Seletivos"
      isLoading={isLoading}
      error={error}
      retry={retry}
    >
      {data && data.length > 0 ? (
        <ul className="space-y-3">
          {data.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
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
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {item.cursinho.name}
                </p>
                <p className="text-xs text-gray-400">
                  Até {new Date(item.endDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Link
                to={`/${PARTNER_PREP}${PARTNER_PREP_INSCRIPTION}/${item.id}`}
                className="shrink-0 text-xs font-medium text-marine hover:underline"
              >
                Inscrever
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-4 text-center text-sm text-gray-400">
          Nenhum processo seletivo aberto no momento
        </p>
      )}
    </WidgetShell>
  );
}
