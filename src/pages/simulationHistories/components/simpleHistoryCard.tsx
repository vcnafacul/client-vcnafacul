import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  CheckCircle2Icon,
  ClockIcon,
  TrophyIcon,
  XCircleIcon,
} from "lucide-react";
import { DateTime } from "luxon";
import { HistoricoDTO } from "../../../dtos/historico/historicoDTO";
import { getFormatingTime } from "../../../utils/getFormatingTime";

interface SimpleHistoryCardProps {
  historico: HistoricoDTO;
  onClick?: (id: string) => void;
}

const getPerformanceColor = (performance: number): string => {
  if (performance >= 0.7) return "from-green-500/10 to-emerald-500/10";
  if (performance >= 0.5) return "from-yellow-500/10 to-orange-500/10";
  return "from-red-500/10 to-pink-500/10";
};

const getStatusIcon = (isComplete: boolean) => {
  return isComplete ? (
    <CheckCircle2Icon className="h-5 w-5 text-green-600" />
  ) : (
    <XCircleIcon className="h-5 w-5 text-orange-500" />
  );
};

export function SimpleHistoryCard({
  historico,
  onClick,
}: SimpleHistoryCardProps) {
  const totalQuestoes = historico.simulado.categoria.quantidadeTotalQuestao;
  const isComplete =
    totalQuestoes !== null &&
    historico.questoesRespondidas === totalQuestoes;

  const geral = historico.aproveitamento?.geral;
  const performanceColor = geral != null
    ? getPerformanceColor(geral)
    : "from-gray-100 to-gray-200";

  const performancePercentage = geral != null
    ? `${(geral * 100).toFixed(2)}%`
    : historico.status === "failed" ? "Erro" : "Processando...";

  const formattedDate = DateTime.fromISO(
    historico.createdAt.toString()
  ).toLocaleString(DateTime.DATE_MED);

  return (
    <Card
      className={`group relative cursor-pointer transition-all duration-300 border-0
        bg-gradient-to-br ${performanceColor}
        shadow-md hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 hover:scale-[1.02]
        overflow-hidden w-[350px]`}
      onClick={() => onClick?.(historico._id)}
    >
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
        opacity-0 group-hover:opacity-100 transition-opacity duration-500
        transform translate-x-[-100%] group-hover:translate-x-[100%]"
        style={{ transition: "transform 0.8s ease-in-out" }}
      />

      <div className="absolute -top-2 -right-2 rotate-12 group-hover:rotate-0 transition-transform duration-300 z-10">
        <Badge
          variant={isComplete ? "default" : "outline"}
          className={`text-sm font-bold px-3 py-1 shadow-lg ${
            isComplete
              ? "bg-gradient-to-r from-green-600 to-green-500"
              : "bg-gradient-to-r from-orange-500 to-orange-400"
          }`}
        >
          {isComplete ? "Completo" : "Incompleto"}
        </Badge>
      </div>

      <CardHeader className="pb-3 pt-4">
        <div className="flex items-start gap-3">
          <div
            className="text-3xl group-hover:scale-125 transition-transform duration-300
            group-hover:rotate-12 flex-shrink-0"
          >
            📝
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className="text-lg font-bold text-primary group-hover:text-primary/80
              transition-colors line-clamp-2 leading-tight"
            >
              {historico.simulado.categoria.nome}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {formattedDate}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div
          className="flex items-center gap-2 p-2 rounded-lg bg-white/50 backdrop-blur-sm
          group-hover:bg-white/70 transition-all duration-300"
        >
          <div className="p-1.5 rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
            <TrophyIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium">
              Aproveitamento
            </p>
            <p className="font-semibold text-sm truncate text-foreground">
              {performancePercentage}
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-2 p-2 rounded-lg bg-white/50 backdrop-blur-sm
          group-hover:bg-white/70 transition-all duration-300"
        >
          <div className="p-1.5 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/10">
            <ClockIcon className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium">
              Tempo Gasto
            </p>
            <p className="font-semibold text-sm truncate text-foreground">
              {getFormatingTime(historico.tempoRealizado)}
            </p>
          </div>
        </div>

        <div
          className="flex items-center justify-between pt-2 border-t border-border/50
          text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-foreground">
              {historico.questoesRespondidas} de{" "}
              {totalQuestoes ?? "?"} questões
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {getStatusIcon(isComplete)}
          </div>
        </div>
      </CardContent>

      <div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0
        opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
    </Card>
  );
}
