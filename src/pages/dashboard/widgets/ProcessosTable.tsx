import { Link } from 'react-router-dom';
import { PARTNER_PREP, PARTNER_PREP_INSCRIPTION } from '@/routes/path';
import { Panel, EmptyState } from '../components/Panel';
import { useDashData } from '../data';

const DAY = 24 * 60 * 60 * 1000;

function daysLeft(endDate: string) {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / DAY);
}

export function ProcessosTable() {
  const { data, isLoading, error, retry } = useDashData('openInscriptions');
  const rows = [...(data ?? [])].sort(
    (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
  );

  return (
    <Panel
      title="Processos seletivos abertos"
      subtitle="Cursinhos parceiros com inscrição aberta, do que fecha antes"
      isLoading={isLoading}
      error={error}
      retry={retry}
    >
      {rows.length === 0 ? (
        <EmptyState>Nenhum processo seletivo aberto no momento.</EmptyState>
      ) : (
        <div className="-mx-5 max-h-[340px] overflow-y-auto sm:-mx-6">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-2.5 font-medium sm:px-6">Cursinho</th>
                <th className="hidden px-3 py-2.5 font-medium md:table-cell">
                  Processo
                </th>
                <th className="px-5 py-2.5 text-right font-medium sm:px-6">
                  Encerra
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((item) => {
                const left = daysLeft(item.endDate);
                const urgent = left <= 3;
                return (
                  <tr key={item.id} className="group hover:bg-slate-50">
                    <td className="px-5 py-3 sm:px-6">
                      <Link
                        to={`/${PARTNER_PREP}${PARTNER_PREP_INSCRIPTION}/${item.id}`}
                        className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marine/40"
                      >
                        {item.cursinho.logo ? (
                          <img
                            src={item.cursinho.logo}
                            alt=""
                            className="h-9 w-9 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-marine/[0.07] text-xs font-bold text-marine">
                            {item.cursinho.name.charAt(0)}
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-marine group-hover:underline">
                            {item.cursinho.name}
                          </span>
                          <span className="block truncate text-xs text-slate-500 md:hidden">
                            {item.name}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="hidden max-w-[220px] truncate px-3 py-3 text-slate-600 md:table-cell">
                      {item.name}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right sm:px-6">
                      <span className="block tabular-nums lining-nums text-slate-700">
                        {new Date(item.endDate).toLocaleDateString('pt-BR')}
                      </span>
                      <span
                        className={
                          urgent
                            ? 'text-xs font-semibold text-[#b35300]'
                            : 'text-xs text-slate-400'
                        }
                      >
                        {left <= 0
                          ? 'último dia'
                          : left === 1
                            ? 'falta 1 dia'
                            : `faltam ${left} dias`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
