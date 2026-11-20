import { Button } from "@/components/ui/button";
import { FileText, CalendarX } from "lucide-react";

interface Props {
  variant: "no-months" | "month-empty";
  onGenerate?: () => void;
  loading?: boolean;
  /** No lugar do botão, para quem não pode gerar (card 07). */
  aviso?: string;
}

export function EmptyState({ variant, onGenerate, loading, aviso }: Props) {
  if (variant === "no-months") {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
        <FileText className="h-10 w-10 opacity-40" />
        <p className="text-body">Nenhum relatório de redação gerado ainda para esta turma.</p>
        {onGenerate && (
          <Button size="sm" onClick={onGenerate} disabled={loading}>
            {loading ? "Gerando..." : "Gerar agora"}
          </Button>
        )}
        {!onGenerate && aviso && <p className="text-caption text-muted-foreground">{aviso}</p>}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
      <CalendarX className="h-8 w-8 opacity-40" />
      <p className="text-body">Nenhum dado de redação disponível para o mês selecionado.</p>
    </div>
  );
}
