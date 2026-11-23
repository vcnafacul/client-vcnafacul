import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { ClassMonthAnalytics, ClassMonthsList } from "@/types/classAnalytics/classSimuladoAnalytics";
import { formatPercent } from "@/utils/formatPercent";

interface Props {
  list: ClassMonthsList;
  monthData: ClassMonthAnalytics | null;
  /** Sem ele, sem o botão — quem não gerencia turmas não atualiza (card 07). */
  onRefresh?: () => void;
  refreshing: boolean;
  requesting: boolean;
}

function formatGeneratedAt(generatedAt: string | null | undefined): string | null {
  if (!generatedAt) return null;
  const date = new Date(generatedAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function KpiHeader({
  list,
  monthData,
  onRefresh,
  refreshing,
  requesting,
}: Props) {
  const isActive = list.coursePeriod.isActive;
  const start = new Date(list.coursePeriod.startDate).toLocaleDateString("pt-BR");
  const end = new Date(list.coursePeriod.endDate).toLocaleDateString("pt-BR");
  const lastUpdatedAt = formatGeneratedAt(monthData?.generatedAt);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-h3 font-semibold">{list.className}</h2>
          {!isActive && <Badge variant="secondary">Turma arquivada</Badge>}
        </div>
        {isActive && (
          <div className="flex flex-col items-end gap-1">
            {onRefresh && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRefresh}
                disabled={requesting}
              >
                {requesting ? (
                  <Spinner size="button" decorative className="mr-2" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {requesting ? "Enfileirando..." : "Atualizar mês atual"}
              </Button>
            )}
            {(refreshing || lastUpdatedAt) && (
              <p className="text-caption text-muted-foreground">
                {refreshing
                  ? "Processando em segundo plano..."
                  : `Atualizado em ${lastUpdatedAt}`}
              </p>
            )}
          </div>
        )}
      </div>
      <p className="text-body text-muted-foreground">Período letivo: {start} – {end}</p>
      {monthData && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-caption text-muted-foreground">Aproveitamento geral</p>
              <p className="text-h1 font-bold">{formatPercent(monthData.geral)}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-caption text-muted-foreground">Engajados</p>
              <p className="text-h1 font-bold">
                {monthData.studentsWithAtLeastOneCompletedAttempt}
                <span className="text-body font-normal text-muted-foreground">/{list.totalStudents}</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-caption text-muted-foreground">Tentativas completas</p>
              <p className="text-h1 font-bold">{monthData.totalAttemptsCompleted}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-caption text-muted-foreground">Total tentativas</p>
              <p className="text-h1 font-bold">{monthData.totalAttempts}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
