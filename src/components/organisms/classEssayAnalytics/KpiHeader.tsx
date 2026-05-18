import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import type {
  ClassEssayMonthAnalytics,
  ClassEssayMonthsList,
} from "@/types/classAnalytics/classEssayAnalytics";

interface Props {
  monthData: ClassEssayMonthAnalytics | null;
  list: ClassEssayMonthsList;
  onRefresh: () => void;
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

function getNotaColor(geral: number): string {
  if (geral <= 400) return "text-red-600";
  if (geral <= 700) return "text-amber-500";
  return "text-green-600";
}

export function KpiHeader({
  monthData,
  list,
  onRefresh,
  refreshing,
  requesting,
}: Props) {
  const isActive = list.coursePeriod.isActive;
  const start = new Date(list.coursePeriod.startDate).toLocaleDateString("pt-BR");
  const end = new Date(list.coursePeriod.endDate).toLocaleDateString("pt-BR");
  const lastUpdatedAt = formatGeneratedAt(monthData?.generatedAt);

  const geral = monthData ? Math.round(monthData.geral) : null;
  const notaColor = geral !== null ? getNotaColor(geral) : "text-gray-400";

  const studentsWithReview = monthData?.studentsWithAtLeastOneHumanReview ?? null;
  const studentsSubmitted =
    monthData?.studentsSubmittedTotal ?? null;
  const essaysReviewed = monthData?.essaysReviewedByHuman ?? 0;
  const essaysSubmitted = monthData?.essaysSubmittedTotal ?? 0;
  const humanReviewRate = monthData?.humanReviewRate ?? 0;
  const coveragePct = Math.round(humanReviewRate * 100);
  const coverageLow = humanReviewRate < 0.5;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{list.className}</h2>
          {!isActive && <Badge variant="secondary">Turma arquivada</Badge>}
        </div>
        {isActive && (
          <div className="flex flex-col items-end gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={onRefresh}
              disabled={requesting}
            >
              {requesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {requesting ? "Enfileirando..." : "Atualizar redação"}
            </Button>
            {(refreshing || lastUpdatedAt) && (
              <p className="text-xs text-gray-400">
                {refreshing
                  ? "Processando em segundo plano..."
                  : `Atualizado em ${lastUpdatedAt}`}
              </p>
            )}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500">Período letivo: {start} – {end}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Nota geral</p>
            <p className={`text-2xl font-bold ${notaColor}`}>
              {geral !== null ? `${geral}` : "—"}
              <span className="text-sm font-normal text-gray-400"> / 1000</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Participantes</p>
            <p className="text-2xl font-bold">
              {studentsSubmitted !== null ? studentsSubmitted : "—"}
              <span className="text-sm font-normal text-gray-400">
                /{list.totalStudents}
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-1">Entregaram redação</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Alunos engajados</p>
            <p className="text-2xl font-bold">
              {studentsWithReview !== null ? studentsWithReview : "—"}
              <span className="text-sm font-normal text-gray-400">/{list.totalStudents}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">Receberam revisão humana</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Redações revisadas</p>
            <p className="text-2xl font-bold">{essaysReviewed}</p>
            <p className="text-xs text-gray-400 mt-1">Total entregues: {essaysSubmitted}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Cobertura humana</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold">{coveragePct}%</p>
              {coverageLow && (
                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200">
                  Cobertura baixa
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
