import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import { ClassMonthAnalytics, ClassMonthsList } from "@/types/classAnalytics/classSimuladoAnalytics";
import { formatPercent } from "@/utils/formatPercent";

interface Props {
  list: ClassMonthsList;
  monthData: ClassMonthAnalytics | null;
  onRefresh: () => void;
  refreshing: boolean;
}

export function KpiHeader({ list, monthData, onRefresh, refreshing }: Props) {
  const isActive = list.coursePeriod.isActive;
  const start = new Date(list.coursePeriod.startDate).toLocaleDateString("pt-BR");
  const end = new Date(list.coursePeriod.endDate).toLocaleDateString("pt-BR");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{list.className}</h2>
          {!isActive && <Badge variant="secondary">Turma arquivada</Badge>}
        </div>
        {isActive && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {refreshing ? "Atualizando..." : "Atualizar agora"}
          </Button>
        )}
      </div>
      <p className="text-sm text-gray-500">Período letivo: {start} – {end}</p>
      {monthData && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500">Aproveitamento geral</p>
              <p className="text-2xl font-bold">{formatPercent(monthData.geral)}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500">Engajados</p>
              <p className="text-2xl font-bold">
                {monthData.studentsWithAtLeastOneCompletedAttempt}
                <span className="text-sm font-normal text-gray-400">/{list.totalStudents}</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500">Tentativas completas</p>
              <p className="text-2xl font-bold">{monthData.totalAttemptsCompleted}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500">Total tentativas</p>
              <p className="text-2xl font-bold">{monthData.totalAttempts}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
