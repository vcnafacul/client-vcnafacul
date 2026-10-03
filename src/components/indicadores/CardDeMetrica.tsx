import { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ExplicacaoDaMetrica, InfoDaMetrica } from "./InfoDaMetrica";

export type TomDaMetrica = "marine" | "green" | "orange" | "red";

const tons: Record<TomDaMetrica, string> = {
  marine: "bg-marine/[0.07] text-marine",
  green: "bg-green/[0.15] text-[#0d7a63]",
  orange: "bg-orange/[0.12] text-[#b35300]",
  red: "bg-red/[0.10] text-red",
};

interface Props {
  icon: LucideIcon;
  rotulo: string;
  /** `null` = sem dado (nunca mostrar 0 no lugar). */
  valor: string | number | null;
  detalhe?: string;
  explicacao: ExplicacaoDaMetrica;
  tom?: TomDaMetrica;
  carregando?: boolean;
  /** Torna o card clicável (ex.: abrir a lista do `08`). */
  onClick?: () => void;
}

/**
 * Card de uma métrica da tela de Indicadores. Mesma cara do `KpiCard` da
 * dashboard, mas com o (i) ao lado do rótulo — o `KpiCard` vira link inteiro,
 * e um botão dentro de link não funciona.
 */
export function CardDeMetrica({
  icon: Icon,
  rotulo,
  valor,
  detalhe,
  explicacao,
  tom = "marine",
  carregando,
  onClick,
}: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(11,39,71,0.04)] sm:p-5",
        onClick && "transition-colors hover:border-marine/30",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl sm:h-10 sm:w-10",
          tons[tom],
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      {carregando ? (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-4 w-28" />
        </div>
      ) : (
        <div className="mt-3 sm:mt-4">
          {onClick ? (
            <button
              type="button"
              onClick={onClick}
              className="text-left text-2xl font-bold leading-none text-marine tabular-nums lining-nums underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marine/40 sm:text-[28px]"
            >
              {valor ?? "—"}
            </button>
          ) : (
            <p className="text-2xl font-bold leading-none text-marine tabular-nums lining-nums sm:text-[28px]">
              {valor ?? "—"}
            </p>
          )}
          <div className="mt-2 flex items-center gap-1">
            <p className="text-sm font-medium text-slate-600">{rotulo}</p>
            <InfoDaMetrica metrica={rotulo} explicacao={explicacao} />
          </div>
          {valor === null ? (
            <p className="mt-0.5 text-xs text-slate-400">Sem dado ainda</p>
          ) : (
            detalhe && <p className="mt-0.5 text-xs text-slate-400">{detalhe}</p>
          )}
        </div>
      )}
    </div>
  );
}
