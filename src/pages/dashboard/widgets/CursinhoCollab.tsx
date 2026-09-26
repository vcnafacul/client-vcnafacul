import { Panel, EmptyState } from '../components/Panel';
import { useDashData } from '../data';

export function CursinhoCollab() {
  const { data, isLoading, error, retry } = useDashData('collaborator');

  return (
    <Panel
      title="Onde colaboro"
      isLoading={isLoading}
      error={error}
      retry={retry}
    >
      {!data ? (
        <EmptyState>Sem cursinho vinculado.</EmptyState>
      ) : (
        <div>
          <div className="flex items-center gap-3">
            {data.cursinho.logo ? (
              <img
                src={data.cursinho.logo}
                alt=""
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-marine/[0.07] text-sm font-bold text-marine">
                {data.cursinho.name.substring(0, 2).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-medium text-marine">
                {data.cursinho.name}
              </p>
              <p className="text-xs text-slate-500">Colaborador ativo</p>
            </div>
          </div>
          {data.frentes.length > 0 && (
            <>
              <p className="mb-2 mt-5 text-xs font-medium text-slate-500">
                Frentes que leciono
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {data.frentes.map((f) => (
                  <li
                    key={f.id}
                    className="rounded-full bg-marine/[0.06] px-2.5 py-1 text-xs font-medium text-marine"
                  >
                    {f.name}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </Panel>
  );
}
