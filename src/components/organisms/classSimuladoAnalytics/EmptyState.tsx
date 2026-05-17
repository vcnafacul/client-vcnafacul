import { Button } from "@/components/ui/button";
import { BarChart3, CalendarX } from "lucide-react";

interface Props {
  variant: "no-months" | "month-empty";
  onGenerate?: () => void;
  loading?: boolean;
}

export function EmptyState({ variant, onGenerate, loading }: Props) {
  if (variant === "no-months") {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center text-gray-500">
        <BarChart3 className="h-10 w-10 opacity-40" />
        <p className="text-sm">Nenhum relatório gerado ainda para esta turma.</p>
        {onGenerate && (
          <Button size="sm" onClick={onGenerate} disabled={loading}>
            {loading ? "Gerando..." : "Gerar agora"}
          </Button>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center text-gray-400">
      <CalendarX className="h-8 w-8 opacity-40" />
      <p className="text-sm">Nenhum dado disponível para o mês selecionado.</p>
    </div>
  );
}
