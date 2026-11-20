import BarChartMui from "@/components/atoms/barChartMui";
import { PieChartMui } from "@/components/atoms/pieChartMui";
import { SocioeconomicAnswer } from "@/pages/partnerPrepInscription/data";
import { ChevronDown, ChevronRight, Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { palette } from "@/lib/palette";

export interface StudentsInfo {
  forms: SocioeconomicAnswer[][];
  isFree: boolean[];
}

// Tipos de gráficos disponíveis
type ChartType = "pie" | "bar" | "line";

// Interface para dados processados
interface ProcessedQuestion {
  question: string;
  questionId: string;
  answers: (string | string[] | number | number[] | boolean)[];
  uniqueAnswers: string[];
  chartType: ChartType;
  totalResponses: number;
}

// Interface para dados de gráfico
interface ChartData {
  id: string;
  label: string;
  value: number;
}

export default function RenderCharts({ data }: { data: StudentsInfo }) {
  console.log("Dados recebidos:", data.forms);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Processa todas as perguntas e suas respostas
  const processedQuestions = useMemo(() => {
    const questionMap = new Map<string, ProcessedQuestion>();

    const determineChartType = (
      uniqueAnswers: string[],
      totalResponses: number
    ): ChartType => {
      const uniqueCount = uniqueAnswers.length;
      const responseRatio = uniqueCount / totalResponses;

      // Se há poucas opções únicas (≤ 5), usa pizza
      if (uniqueCount <= 5) {
        return "pie";
      }

      // Se há muitas opções únicas ou alta dispersão, usa barra
      if (uniqueCount > 10 || responseRatio > 0.8) {
        return "bar";
      }

      // Para casos intermediários, usa barra por padrão
      return "bar";
    };

    // Coleta todas as respostas por pergunta
    data.forms.forEach((form) => {
      form.forEach((answer) => {
        // Sistema novo: usa questionId, Sistema antigo: usa question como fallback
        const questionKey = answer.questionId || answer.question;

        if (!questionMap.has(questionKey)) {
          questionMap.set(questionKey, {
            question: answer.question,
            questionId: answer.questionId || answer.question, // Fallback para sistema antigo
            answers: [],
            uniqueAnswers: [],
            chartType: "pie",
            totalResponses: 0,
          });
        }

        const question = questionMap.get(questionKey)!;
        question.answers.push(answer.answer);
      });
    });

    // Processa cada pergunta
    questionMap.forEach((question) => {
      // Remove respostas vazias/nulas
      const validAnswers = question.answers.filter(
        (answer) => answer !== null && answer !== undefined && answer !== ""
      );

      question.totalResponses = validAnswers.length;

      // Converte todas as respostas para string para análise
      const stringAnswers = validAnswers.map((answer) => {
        if (Array.isArray(answer)) {
          return answer.join(", ");
        }
        return String(answer);
      });

      // Encontra respostas únicas
      question.uniqueAnswers = [...new Set(stringAnswers)];

      // Determina o tipo de gráfico baseado nas características dos dados
      question.chartType = determineChartType(
        question.uniqueAnswers,
        question.totalResponses
      );
    });

    console.log("Perguntas processadas:", Array.from(questionMap.values()));
    return Array.from(questionMap.values());
  }, [data.forms]);

  // Função para determinar o tipo de gráfico mais apropriado

  // Converte dados para formato de gráfico
  const convertToChartData = (question: ProcessedQuestion): ChartData[] => {
    const counts = new Map<string, number>();

    // Conta ocorrências de cada resposta
    question.answers.forEach((answer) => {
      const stringAnswer = Array.isArray(answer)
        ? answer.join(", ")
        : String(answer);
      if (
        stringAnswer &&
        stringAnswer !== "null" &&
        stringAnswer !== "undefined" &&
        stringAnswer !== ""
      ) {
        counts.set(stringAnswer, (counts.get(stringAnswer) || 0) + 1);
      }
    });

    // Converte para formato do gráfico
    const chartData = question.uniqueAnswers
      .map((answer) => ({
        id: answer,
        label: answer.length > 30 ? answer.substring(0, 30) + "..." : answer,
        value: counts.get(answer) || 0,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value); // Ordena por frequência

    console.log(`Dados do gráfico para "${question.question}":`, chartData);
    return chartData;
  };

  // Perguntas selecionadas para exibição
  const questionsToShow = showAllQuestions
    ? processedQuestions
    : processedQuestions.filter((q) =>
        selectedQuestions.includes(q.questionId)
      );

  // Adiciona automaticamente perguntas interessantes apenas na primeira carga
  const defaultQuestions = useMemo(() => {
    if (!hasUserInteracted && selectedQuestions.length === 0) {
      // Seleciona perguntas com mais respostas e tipos interessantes
      return processedQuestions
        .filter((q) => q.totalResponses > 0)
        .sort((a, b) => b.totalResponses - a.totalResponses)
        .slice(0, 6)
        .map((q) => q.questionId);
    }
    return selectedQuestions;
  }, [processedQuestions, selectedQuestions, hasUserInteracted]);

  // Atualiza perguntas selecionadas apenas na primeira carga
  useEffect(() => {
    if (
      !hasUserInteracted &&
      selectedQuestions.length === 0 &&
      defaultQuestions.length > 0
    ) {
      setSelectedQuestions(defaultQuestions);
    }
  }, [defaultQuestions, selectedQuestions, hasUserInteracted]);

  // Gráfico especial para isento/pagante
  const isentoChartData: ChartData[] = [
    {
      id: "Sim",
      label: "Isento",
      value: data.isFree.filter((isFree) => isFree).length,
    },
    {
      id: "Não",
      label: "Pagante",
      value: data.isFree.filter((isFree) => !isFree).length,
    },
  ];

  return (
    <div className="text-foreground flex flex-col gap-8 w-full">
      {/* Controles Colapsáveis */}
      <div className="bg-page rounded-lg border border-border">
        {/* Header do Accordion */}
        <button
          onClick={() => setIsConfigOpen(!isConfigOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">
              Configurações dos Gráficos
            </span>
            <span className="text-body text-muted-foreground">
              ({selectedQuestions.length} perguntas selecionadas)
            </span>
          </div>
          {isConfigOpen ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {/* Conteúdo Colapsável */}
        {isConfigOpen && (
          <div className="px-4 pb-4 border-t border-border">
            <div className="flex flex-col gap-4 pt-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showAllQuestions}
                    onChange={(e) => {
                      setHasUserInteracted(true);
                      setShowAllQuestions(e.target.checked);
                    }}
                    className="rounded"
                  />
                  <span className="font-medium">
                    Mostrar todas as perguntas
                  </span>
                </label>
              </div>

              {!showAllQuestions && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-body font-medium text-foreground">
                      Selecionar perguntas específicas:
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setHasUserInteracted(true);
                          const allQuestionIds = processedQuestions
                            .filter((q) => q.totalResponses > 0)
                            .map((q) => q.questionId);
                          setSelectedQuestions(allQuestionIds);
                        }}
                        className="text-caption px-2 py-1 bg-info-muted text-info rounded hover:bg-info-muted transition-colors"
                      >
                        Selecionar Todas
                      </button>
                      <button
                        onClick={() => {
                          setHasUserInteracted(true);
                          setSelectedQuestions([]);
                        }}
                        className="text-caption px-2 py-1 bg-muted text-foreground rounded hover:bg-muted transition-colors"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {processedQuestions
                      .filter((q) => q.totalResponses > 0)
                      .map((question) => (
                        <label
                          key={question.questionId}
                          className="flex items-start gap-3 p-2 hover:bg-muted rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedQuestions.includes(
                              question.questionId
                            )}
                            onChange={(e) => {
                              setHasUserInteracted(true);
                              if (e.target.checked) {
                                setSelectedQuestions((prev) => [
                                  ...prev,
                                  question.questionId,
                                ]);
                              } else {
                                setSelectedQuestions((prev) =>
                                  prev.filter(
                                    (id) => id !== question.questionId
                                  )
                                );
                              }
                            }}
                            className="rounded mt-0.5"
                          />
                          <div className="flex-1">
                            <span className="text-body text-foreground">
                              {question.question}
                            </span>
                            <div className="text-caption text-muted-foreground mt-1">
                              {question.totalResponses} respostas •{" "}
                              {question.uniqueAnswers.length} opções
                            </div>
                          </div>
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Gráfico especial de isento/pagante */}
      <div className="flex flex-col gap-1">
        <span className="font-medium">Relação Isento vs Pagante</span>
        <div className="h-[300px] w-fit">
          <PieChartMui data={isentoChartData} width={400} />
        </div>
      </div>

      {/* Gráficos dinâmicos */}
      <div className="flex gap-8 flex-wrap w-full justify-center overflow-y-auto scrollbar-hide">
        {questionsToShow.map((question) => {
          const chartData = convertToChartData(question);

          if (chartData.length === 0) return null;

          return (
            <div key={question.questionId} className="flex flex-col gap-1">
              <span className="font-medium text-body">
                {question.question.length > 60
                  ? question.question.substring(0, 60) + "..."
                  : question.question}
              </span>
              <span className="text-caption text-muted-foreground">
                {question.totalResponses} respostas •{" "}
                {question.uniqueAnswers.length} opções
              </span>

              <div className="h-[350px] min-w-80 w-full">
                {question.chartType === "pie" ? (
                  <PieChartMui
                    data={chartData}
                    width={Math.max(400, chartData.length * 80)}
                  />
                ) : (
                  <BarChartMui
                    data={chartData}
                    color={getRandomColor(question.questionId)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Estatísticas gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-info-muted rounded-lg">
        <div className="text-center">
          <div className="text-h1 font-bold text-info">
            {data.forms.length}
          </div>
          <div className="text-body text-muted-foreground">Total de Estudantes</div>
        </div>
        <div className="text-center">
          <div className="text-h1 font-bold text-success">
            {processedQuestions.filter((q) => q.totalResponses > 0).length}
          </div>
          <div className="text-body text-muted-foreground">Perguntas Respondidas</div>
        </div>
        <div className="text-center">
          <div className="text-h1 font-bold text-foreground">
            {Math.round(
              processedQuestions.reduce((sum, q) => sum + q.totalResponses, 0) /
                processedQuestions.length || 0
            )}
          </div>
          <div className="text-body text-muted-foreground">Média de Respostas</div>
        </div>
      </div>
    </div>
  );
}

// Função para gerar cores consistentes baseadas no ID
function getRandomColor(seed: string): string {
  const colors = [
    palette.red[500],
    palette.mint[400],
    palette.blue[400],
    palette.yellow[300],
    palette.orange[400],
    palette.neutral[300],
    palette.yellow[200],
    palette.orange[600],
    palette.orange[700],
    palette.mint[400],
  ];

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
