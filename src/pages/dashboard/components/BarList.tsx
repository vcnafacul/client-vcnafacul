import { cn } from '@/lib/utils';

export type BarListItem = {
  id: string;
  label: string;
  value: number;
  /** Texto à direita; por padrão o próprio valor. */
  display?: string;
  tone?: 'marine' | 'green' | 'orange' | 'red';
};

const barTone = {
  marine: 'bg-marine',
  green: 'bg-green',
  orange: 'bg-orange',
  red: 'bg-red',
};

/**
 * Barras horizontais em HTML. Para "categoria → valor" lê melhor que um
 * gráfico de barras: rótulo longo não precisa rotacionar nem truncar no eixo.
 */
export function BarList({ items, max }: { items: BarListItem[]; max?: number }) {
  const top = max ?? Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-slate-600">{item.label}</span>
            <span className="shrink-0 font-semibold tabular-nums lining-nums text-marine">
              {item.display ?? item.value}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div
              className={cn('h-2 rounded-full', barTone[item.tone ?? 'marine'])}
              style={{ width: `${Math.max((item.value / top) * 100, 2)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
