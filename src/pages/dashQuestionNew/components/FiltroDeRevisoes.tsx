import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { REVISOES_DO_FILTRO, RevisaoDoFiltro, resumoDasRevisoes } from "./filtrosDoBanco";

/**
 * "Revisões necessárias" do filtro do banco (tickets/043): um campo com
 * checkbox dentro. Marcar várias = a questão precisa ter TODAS ("e").
 */
export function FiltroDeRevisoes({
  value,
  onChange,
  disabled,
}: {
  value: RevisaoDoFiltro[];
  onChange: (v: RevisaoDoFiltro[]) => void;
  disabled?: boolean;
}) {
  const alternar = (campo: RevisaoDoFiltro, marcar: boolean) =>
    onChange(
      marcar
        ? REVISOES_DO_FILTRO.map((r) => r.campo).filter((c) => c === campo || value.includes(c))
        : value.filter((c) => c !== campo),
    );
  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          id="revisoes"
          type="button"
          data-testid="filtro-revisoes"
          className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className={`truncate ${value.length ? "" : "text-muted-foreground"}`}>
            {resumoDasRevisoes(value)}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" collisionPadding={16} className="w-[min(20rem,calc(100vw-2rem))] p-3">
        <p className="mb-2 text-xs text-muted-foreground">
          A questão precisa ter <strong>todas</strong> as marcadas.
        </p>
        <ul className="flex flex-col gap-2">
          {REVISOES_DO_FILTRO.map((r) => (
            <li key={r.campo}>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={value.includes(r.campo)}
                  onCheckedChange={(v) => alternar(r.campo, v === true)}
                />
                {r.rotulo}
              </label>
            </li>
          ))}
        </ul>
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="mt-3 text-xs font-medium text-primary hover:underline"
          >
            Desmarcar todas
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
