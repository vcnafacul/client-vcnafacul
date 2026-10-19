import { Button } from "@/components/ui/button";
import { Period } from "@/enums/analytics/period";
import { MenuItem, Select, Typography } from "@mui/material";
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
        <Typography variant="h4" fontWeight="bold" className="text-marine">
          Monitoramento de Atividades
        </Typography>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <SeletorDeCursinho
            cursinhos={cursinhos}
            valor={cursinho?.id ?? null}
            onChange={onCursinho}
            carregando={carregandoCursinhos}
          />
          <div>
            <Select
              value={period}
              onChange={(e) => onPeriod(e.target.value as Period)}
              size="small"
              sx={{ minWidth: 150 }}
              className="w-full sm:w-auto"
              inputProps={{ "aria-label": "Período" }}
            >
              <MenuItem value={Period.day}>Diário</MenuItem>
              <MenuItem value={Period.month}>Mensal</MenuItem>
              <MenuItem value={Period.year}>Anual</MenuItem>
            </Select>
            <p className="text-xs text-grey mt-1">Afeta gráficos temporais</p>
          </div>
        </div>
      </div>
      {cursinho && (
        <div
          role="status"
          className="mt-3 flex flex-col gap-2 rounded border border-lightGray bg-white px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
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
