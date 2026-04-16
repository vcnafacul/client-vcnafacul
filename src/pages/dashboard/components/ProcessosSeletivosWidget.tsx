import { useAuthStore } from '@/store/auth';
import { getOpenInscriptions, OpenInscription } from '@/services/dashboard';
import { useWidgetData } from '../hooks/useWidgetData';
import { WidgetShell } from './WidgetShell';
import { WidgetIcon } from './WidgetIcon';
import { Link } from 'react-router-dom';
import { PARTNER_PREP, PARTNER_PREP_INSCRIPTION } from '@/routes/path';
import { GraduationCap } from 'lucide-react';

export function ProcessosSeletivosWidget() {
  const token = useAuthStore((s) => s.data.token);
  const { data, isLoading, error, retry } = useWidgetData<OpenInscription[]>(
    () => getOpenInscriptions(token),
  );

  return (
    <WidgetShell
      title="Processos Seletivos"
      widgetId="processos-seletivos"
      icon={<WidgetIcon icon={GraduationCap} />}
      isLoading={isLoading}
      error={error}
      retry={retry}
    >
      {data && data.length > 0 ? (
        <div>
          <ul className="max-h-[200px] space-y-2 overflow-y-auto scrollbar-hide">
            {data.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/${PARTNER_PREP}${PARTNER_PREP_INSCRIPTION}/${item.id}`}
                  className="flex items-center gap-2 rounded-lg p-1.5 -mx-1.5 transition-colors hover:bg-black/[0.03]"
                >
                  {item.cursinho.logo ? (
                    <img
                      src={item.cursinho.logo}
                      alt={item.cursinho.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-marine/10 to-green/15 text-xs font-bold text-marine">
                      {item.cursinho.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">
                      {item.cursinho.name}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Até {new Date(item.endDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-green/15 px-2 py-0.5 text-[10px] font-semibold text-[#0d7a63]">
                    Aberto
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="py-4 text-center text-sm text-gray-400">
          Nenhum processo seletivo aberto no momento
        </p>
      )}
    </WidgetShell>
  );
}
