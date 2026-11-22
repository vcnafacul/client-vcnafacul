import { Button } from "@/components/ui/button";
import { Period } from "@/enums/analytics/period";
import { OptionsSelect } from "@/components/ui/options-select";
import { CursinhoDoFiltro, FORA_DO_RECORTE } from "./recorte";
import { SeletorDeCursinho } from "@/components/molecules/seletorDeCursinho";

type Props = {
  period: Period;
  onPeriod: (p: Period) => void;
  cursinhos: CursinhoDoFiltro[];
  cursinho: CursinhoDoFiltro | null;
  onCursinho: (id: string | null) => void;
  carregandoCursinhos?: boolean;
};

/** Título, período e cursinho (tickets/044, card 06). */
export function CabecalhoDoMonitoramento({
  period,
  onPeriod,
  cursinhos,
  cursinho,
  onCursinho,
  carregandoCursinhos,
}: Props) {
  return (
    <div className="px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-h2 text-foreground">Monitoramento de Atividades</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <SeletorDeCursinho
            cursinhos={cursinhos}
            valor={cursinho?.id ?? null}
            onChange={onCursinho}
            carregando={carregandoCursinhos}
          />
          <div>
            <OptionsSelect
              value={period}
              onValueChange={onPeriod}
              options={[
                { value: Period.day, label: "Diário" },
                { value: Period.month, label: "Mensal" },
                { value: Period.year, label: "Anual" },
              ]}
              aria-label="Período"
              className="w-full sm:w-auto sm:min-w-[150px]"
            />
            <p className="text-caption text-muted-foreground mt-1">Afeta gráficos temporais</p>
          </div>
        </div>
      </div>
      {cursinho && (
        <div
          role="status"
          className="mt-3 flex flex-col gap-2 rounded-sm border border-border bg-white px-3 py-2 text-body sm:flex-row sm:items-center sm:justify-between"
        >
          <p>
            Mostrando só <strong>{cursinho.name}</strong>. Fora do recorte:{" "}
            {FORA_DO_RECORTE.join(", ")}.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0"
            onClick={() => onCursinho(null)}
          >
            Ver plataforma inteira
          </Button>
        </div>
      )}
    </div>
  );
}
