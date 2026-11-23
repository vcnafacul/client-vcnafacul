import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { useToastAsync } from "@/hooks/useToastAsync";
import { getLogs } from "@/services/question/getLogs";
import { useAuthStore } from "@/store/auth";
import { AuditLog } from "@/types/auditLog/auditLog";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  FileEdit,
  History,
  Mail,
} from "lucide-react";
import { useEffect, useState } from "react";

interface TabHistoricoRefactoredProps {
  questionId: string;
}

export function TabHistoricoRefactored({
  questionId,
}: TabHistoricoRefactoredProps) {
  const {
    data: { token },
  } = useAuthStore();
  const executeAsync = useToastAsync();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadLogs();
  }, [questionId]);

  const loadLogs = async () => {
    setIsLoading(true);
    await executeAsync({
      action: () => getLogs(questionId, token),
      loadingMessage: "Carregando histórico...",
      errorMessage: "Erro ao carregar histórico",
      onSuccess: (data) => {
        setLogs(data);
      },
      onFinally: () => setIsLoading(false),
    });
  };

  const toggleLogExpansion = (index: number) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedLogs(newExpanded);
  };

  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return "Data inválida";
    }
  };

  const parseChanges = (changesString: string) => {
    try {
      return JSON.parse(changesString);
    } catch {
      return { erro: "Não foi possível processar as alterações" };
    }
  };

  const getStatusLabel = (status: number): string => {
    switch (status) {
      case StatusEnum.Approved:
        return "✅ Aprovada";
      case StatusEnum.Pending:
        return "⏳ Pendente";
      case StatusEnum.Rejected:
        return "❌ Rejeitada";
      case StatusEnum.All:
        return "Todos";
      default:
        return `Status ${status}`;
    }
  };

  const renderChangeValue = (key: string, value: any): string => {
    if (value === null || value === undefined) {
      return "Não definido";
    }
    if (typeof value === "boolean") {
      return value ? "Sim" : "Não";
    }
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    if (typeof value === "number") {
      // Se a chave for 'status', converter para StatusEnum
      if (key === "status") {
        return getStatusLabel(value);
      }
      return value.toString();
    }
    return String(value);
  };

  const getChangeTypeColor = (key: string): string => {
    const colorMap: Record<string, string> = {
      status: "bg-info-muted text-info border-info/40",
      prova: "bg-primary/10 text-primary border-primary/30",
      materia: "bg-success-muted text-success border-success",
      frente1: "bg-cta/10 text-foreground border-cta/40",
      frente2: "bg-cta/10 text-foreground border-cta/40",
      frente3: "bg-cta/10 text-foreground border-cta/40",
      enemArea: "bg-secondary text-secondary-foreground border-border",
      textoQuestao: "bg-warning-muted text-warning border-warning/40",
      alternativa: "bg-destructive-muted text-destructive border-destructive",
    };
    return colorMap[key] || "bg-muted text-foreground border-border";
  };

  const translateFieldName = (fieldName: string): string => {
    const translations: Record<string, string> = {
      status: "Status",
      prova: "Prova",
      materia: "Matéria",
      frente1: "Frente Principal",
      frente2: "Frente Secundária",
      frente3: "Frente Terciária",
      enemArea: "Área ENEM",
      textoQuestao: "Texto da Questão",
      pergunta: "Pergunta",
      textoAlternativaA: "Alternativa A",
      textoAlternativaB: "Alternativa B",
      textoAlternativaC: "Alternativa C",
      textoAlternativaD: "Alternativa D",
      textoAlternativaE: "Alternativa E",
      alternativa: "Resposta Correta",
      imageId: "Imagem",
      numero: "Número",
      provaClassification: "Classificação de Prova",
      subjectClassification: "Classificação de Matéria",
      textClassification: "Classificação de Texto",
      imageClassfication: "Classificação de Imagem",
      alternativeClassfication: "Classificação de Alternativa",
      reported: "Reportado",
    };
    return translations[fieldName] || fieldName;
  };

  const estado = isLoading ? "loading" : logs.length ? "ready" : "empty";

  return (
    <div className="space-y-6 p-2 sm:p-6">
      {/* Header */}
      {estado === "ready" && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Histórico de Alterações
          </CardTitle>
          <p className="text-body text-muted-foreground mt-1">
            {logs.length} {logs.length === 1 ? "registro" : "registros"} de
            alteração
          </p>
        </CardHeader>
      </Card>
      )}

      {/* Timeline de Logs (D18) */}
      <Timeline
        aria-label="Histórico de alterações da questão"
        state={estado}
        empty={{
          icon: History,
          title: "Nenhum histórico encontrado",
          hint: "Esta questão ainda não possui registros de alterações",
        }}
      >
        {logs.map((log, index) => {
          const changes = parseChanges(log.changes);
          const isExpanded = expandedLogs.has(index);
          const changesCount = Object.keys(changes).length;

          return (
            <TimelineItem
              key={index}
              icon={FileEdit}
              variant="info"
              who={<span className="break-words">{log.user.name}</span>}
              what={`${changesCount} ${changesCount === 1 ? "alteração" : "alterações"}`}
              when={new Date(log.createdAt)}
              detail={
                <div className="space-y-2">
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm text-muted-foreground">
                    <span className="flex min-w-0 items-center gap-1">
                      <Mail aria-hidden="true" className="h-3 w-3 shrink-0" />
                      <span className="break-all">{log.user.email}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock aria-hidden="true" className="h-3 w-3 shrink-0" />
                      {formatRelativeTime(log.createdAt)}
                    </span>
                  </p>
                  {Object.entries(changes)
                    .slice(0, isExpanded ? undefined : 3)
                    .map(([key, value], idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border ${getChangeTypeColor(
                          key
                        )}`}
                      >
                        <p className="text-caption font-semibold uppercase opacity-75 mb-1">
                          {translateFieldName(key)}
                        </p>
                        <p className="text-body font-medium break-words">
                          {renderChangeValue(key, value)}
                        </p>
                      </div>
                    ))}

                  {/* Botão Expandir/Colapsar */}
                  {changesCount > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLogExpansion(index)}
                      className="w-full"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Mostrar menos
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Mostrar mais {changesCount - 3}{" "}
                          {changesCount - 3 === 1 ? "alteração" : "alterações"}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              }
            />
          );
        })}
      </Timeline>
    </div>
  );
}
