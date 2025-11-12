import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HistoricoDTO } from "../../../dtos/historico/historicoDTO";
import { StatusEnum } from "../../../enums/generic/statusEnum";
import { getFormatingTime } from "../../../utils/getFormatingTime";
import { DateTime } from "luxon";
import { ClockIcon, CheckCircle2Icon, XCircleIcon, TrophyIcon } from "lucide-react";

interface SimpleHistoryCardProps {
  historico: HistoricoDTO;
  onClick?: (id: string) => void;
}

// Função para obter cor baseada no aproveitamento
const getPerformanceColor = (performance: number): string => {
  if (performance >= 0.7) return "from-green-500/10 to-emerald-500/10";
  if (performance >= 0.5) return "from-yellow-500/10 to-orange-500/10";
  return "from-red-500/10 to-pink-500/10";
};

// Função para obter ícone de status
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
  const isComplete =
    historico.questoesRespondidas ===
    historico.simulado.tipo.quantidadeTotalQuestao;

  const performanceColor = getPerformanceColor(
    historico.aproveitamento.geral
  );

  const performancePercentage = (
    historico.aproveitamento.geral * 100
  ).toFixed(2);

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
      {/* Efeito de brilho no hover */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
        opacity-0 group-hover:opacity-100 transition-opacity duration-500 
        transform translate-x-[-100%] group-hover:translate-x-[100%]"
        style={{ transition: "transform 0.8s ease-in-out" }}
      />

      {/* Badge de status flutuante no canto superior direito */}
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
          {/* Ícone animado do troféu */}
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
              {historico.simulado.tipo.nome}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Aproveitamento - Destaque */}
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
              {performancePercentage}%
            </p>
          </div>
        </div>

        {/* Tempo */}
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

        {/* Questões e Status - Footer */}
        <div
          className="flex items-center justify-between pt-2 border-t border-border/50
          text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-foreground">
              {historico.questoesRespondidas} de{" "}
              {historico.simulado.tipo.quantidadeTotalQuestao} questões
            </span>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-1.5">
            {getStatusIcon(isComplete)}
          </div>
        </div>
      </CardContent>

      {/* Indicador de clique */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0
        opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
    </Card>
  );
}

