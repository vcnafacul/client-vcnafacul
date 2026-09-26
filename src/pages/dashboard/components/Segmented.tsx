import { cn } from '@/lib/utils';

interface SegmentedProps<T extends string> {
  label: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}

/** Seletor compacto de período, no lugar do "Day / Week / Month" do TailAdmin. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex rounded-lg bg-slate-100 p-0.5"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marine/40',
            value === o.value
              ? 'bg-white text-marine shadow-sm'
              : 'text-slate-500 hover:text-marine',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
