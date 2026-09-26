import { useId } from "react";
import { cn } from "@/lib/utils";
import { intervaloInvalido, type IntervaloDeDatas } from "./intervaloDeDatas";
import { dashV2 } from "./tokens";

export const TEXTO_INTERVALO_INVERTIDO =
  "A data final é anterior à inicial — o filtro não está sendo aplicado.";

export interface DashDateRangeFilterProps {
  /** O que se filtra, ex. "Inicia em". Visível, e prefixo dos rótulos de leitor de tela. */
  label: string;
  /** Controlado: `yyyy-mm-dd`. O "Limpar filtros" da barra zera por aqui. */
  value: IntervaloDeDatas;
  onChange: (v: IntervaloDeDatas) => void;
}

/**
 * Filtro de intervalo de datas da Dash V2, para o `filters` do
 * `DashListTemplate` (card 03 da série `tickets/021-dash-v2-processo-seletivo`).
 * A regra de comparação é o `dentroDoIntervalo`.
 *
 * ⚠️ **`<input type="date">` nativo, e não um calendário do Radix**: teclado e
 * leitor de tela de graça, e nenhum Popover — cada montagem de Popover custa
 * segundos de CPU no jsdom (ver README do V2).
 *
 * ⚠️ **Controlado, sem `key={resetKey}`**: o guia do V2 proíbe remontar para
 * limpar — remontar descarta ordenação, página e rolagem.
 */
export function DashDateRangeFilter({ label, value, onChange }: DashDateRangeFilterProps) {
  const idDoRotulo = useId();
  const idDoAviso = useId();
  const invertido = intervaloInvalido(value);

  const campo = (lado: "de" | "ate", rotulo: string) => (
    <label className={cn("flex items-center gap-1.5 text-sm", dashV2.text.secondary)}>
      <span>{rotulo}</span>
      <input
        type="date"
        aria-label={`${label} — ${rotulo}`}
        aria-invalid={invertido || undefined}
        aria-describedby={invertido ? idDoAviso : undefined}
        value={value[lado] ?? ""}
        // O próprio seletor do navegador já não oferece o dia impossível
        min={lado === "ate" ? value.de : undefined}
        max={lado === "de" ? value.ate : undefined}
        onChange={(e) => onChange({ ...value, [lado]: e.target.value || undefined })}
        className={cn(
          "h-9 rounded-md border px-2 text-sm outline-none",
          invertido ? dashV2.invalid : dashV2.border,
          dashV2.surface,
          dashV2.text.primary,
          dashV2.focus,
        )}
      />
    </label>
  );

  return (
    <div role="group" aria-labelledby={idDoRotulo} className="flex flex-col gap-1">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <span id={idDoRotulo} className={cn("text-sm font-semibold", dashV2.text.primary)}>
          {label}
        </span>
        {campo("de", "de")}
        {campo("ate", "até")}
      </div>
      {invertido ? (
        <p id={idDoAviso} role="alert" className={cn("text-xs", dashV2.text.secondary)}>
          {TEXTO_INTERVALO_INVERTIDO}
        </p>
      ) : null}
    </div>
  );
}

export default DashDateRangeFilter;
