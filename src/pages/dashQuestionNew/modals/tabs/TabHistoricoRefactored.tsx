import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { useToastAsync } from "@/hooks/useToastAsync";
import { getLogs } from "@/services/question/getLogs";
import { useAuthStore } from "@/store/auth";
import { AuditLog } from "@/types/auditLog/auditLog";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  FileEdit,
  History,
  Mail,
  User,
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
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
      status: "bg-blue-100 text-blue-800 border-blue-300",
      prova: "bg-purple-100 text-purple-800 border-purple-300",
      materia: "bg-green-100 text-green-800 border-green-300",
      frente1: "bg-orange-100 text-orange-800 border-orange-300",
      frente2: "bg-orange-100 text-orange-800 border-orange-300",
      frente3: "bg-orange-100 text-orange-800 border-orange-300",
      enemArea: "bg-teal-100 text-teal-800 border-teal-300",
      textoQuestao: "bg-amber-100 text-amber-800 border-amber-300",
      alternativa: "bg-red-100 text-red-800 border-red-300",
    };
    return colorMap[key] || "bg-gray-100 text-gray-800 border-gray-300";
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

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <Card className="m-6">
        <CardContent className="flex flex-col items-center justify-center p-12">
          <History className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Nenhum histórico encontrado
          </h3>
          <p className="text-gray-500">
            Esta questão ainda não possui registros de alterações
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Histórico de Alterações
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {logs.length} {logs.length === 1 ? "registro" : "registros"} de
            alteração
          </p>
        </CardHeader>
      </Card>

      {/* Timeline de Logs */}
      <div className="relative space-y-4">
        {/* Linha vertical da timeline */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />

        {logs.map((log, index) => {
          const changes = parseChanges(log.changes);
          const isExpanded = expandedLogs.has(index);
          const changesCount = Object.keys(changes).length;

          return (
            <Card
              key={index}
              className="ml-12 relative hover:shadow-lg transition-shadow duration-300"
            >
              {/* Ponto da timeline */}
              <div className="absolute -left-[27px] top-6 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-md" />

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Usuário */}
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-base">
                          {log.user.name}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {log.user.email}
                        </div>
                      </div>
                    </div>

                    {/* Data/Hora */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(log.createdAt)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {formatRelativeTime(log.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Badge de quantidade de alterações */}
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <FileEdit className="h-3 w-3" />
                    {changesCount}{" "}
                    {changesCount === 1 ? "alteração" : "alterações"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                {/* Alterações */}
                <div className="space-y-2">
                  {Object.entries(changes)
                    .slice(0, isExpanded ? undefined : 3)
                    .map(([key, value], idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border ${getChangeTypeColor(
                          key
                        )}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-xs font-semibold uppercase opacity-75 mb-1">
                              {translateFieldName(key)}
                            </p>
                            <p className="text-sm font-medium break-words">
                              {renderChangeValue(key, value)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Botão Expandir/Colapsar */}
                  {changesCount > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLogExpansion(index)}
                      className="w-full mt-2"
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
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
