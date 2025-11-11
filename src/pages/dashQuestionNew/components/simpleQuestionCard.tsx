import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionCardBase } from "@/dtos/question/questionV2Dto";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { formatDate } from "@/utils/date";
import { BookOpenIcon, CalendarIcon, GraduationCapIcon } from "lucide-react";
import { StatusIndicator } from "./statusBadge";

interface SimpleQuestionCardProps {
  question: QuestionCardBase;
  onClick?: (questionId: string) => void;
}

// Função para escolher cor baseada na área
const getAreaColor = (area: string): string => {
  const colors: Record<string, string> = {
    Linguagens: "from-purple-500/10 to-pink-500/10",
    Matemática: "from-blue-500/10 to-cyan-500/10",
    "Ciências da Natureza": "from-green-500/10 to-emerald-500/10",
    "Ciências Humanas": "from-amber-500/10 to-orange-500/10",
  };

  return colors[area] || "from-gray-500/10 to-slate-500/10";
};

// Função para ícone da área
const getAreaIcon = (area: string) => {
  switch (area) {
    case "Linguagens":
      return "📚";
    case "Matemática":
      return "🔢";
    case "Ciências da Natureza":
      return "🔬";
    case "Ciências Humanas":
      return "🌍";
    default:
      return "📖";
  }
};

// Função para obter o emoji do status
const getStatusEmoji = (status: StatusEnum): string => {
  switch (status) {
    case StatusEnum.Approved:
      return "✅";
    case StatusEnum.Pending:
      return "⏳";
    case StatusEnum.Rejected:
      return "❌";
    default:
      return "";
  }
};

export function SimpleQuestionCard({
  question,
  onClick,
}: SimpleQuestionCardProps) {
  const areaColor = getAreaColor(question.enemArea);
  const areaIcon = getAreaIcon(question.enemArea);

  return (
    <Card
      className={`group relative cursor-pointer transition-all duration-300 border-0
        bg-gradient-to-br ${areaColor}
        shadow-md hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 hover:scale-[1.02]
        overflow-hidden w-[350px]`}
      onClick={() => onClick?.(question._id)}
    >
      {/* Efeito de brilho no hover */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
        opacity-0 group-hover:opacity-100 transition-opacity duration-500 
        transform translate-x-[-100%] group-hover:translate-x-[100%]"
        style={{ transition: "transform 0.8s ease-in-out" }}
      />

      {/* Badge de número flutuante no canto superior direito */}
      <div className="absolute -top-2 -right-2 rotate-12 group-hover:rotate-0 transition-transform duration-300 z-10">
        <Badge
          variant="default"
          className="text-base font-bold px-3 py-1 shadow-lg bg-gradient-to-r from-primary to-primary/80"
        >
          #{question.numero}
        </Badge>
      </div>

      <CardHeader className="pb-3 pt-4">
        <div className="flex items-start gap-3">
          {/* Ícone animado da área */}
          <div
            className="text-3xl group-hover:scale-125 transition-transform duration-300 
            group-hover:rotate-12 flex-shrink-0"
          >
            {areaIcon}
          </div>

          <div className="flex-1 min-w-0">
            <CardTitle
              className="text-lg font-bold text-primary group-hover:text-primary/80 
              transition-colors line-clamp-2 leading-tight"
            >
              {question.prova}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Área ENEM - Destaque */}
        <div
          className="flex items-center gap-2 p-2 rounded-lg bg-white/50 backdrop-blur-sm
          group-hover:bg-white/70 transition-all duration-300"
        >
          <div className="p-1.5 rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
            <GraduationCapIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium">
              Área ENEM
            </p>
            <p className="font-semibold text-sm truncate text-foreground">
              {question.enemArea || "Não definida"}
            </p>
          </div>
        </div>

        {/* Matéria */}
        <div
          className="flex items-center gap-2 p-2 rounded-lg bg-white/50 backdrop-blur-sm
          group-hover:bg-white/70 transition-all duration-300"
        >
          <div className="p-1.5 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/10">
            <BookOpenIcon className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Matéria</p>
            <p className="font-semibold text-sm truncate text-foreground">
              {question.materia || "Não definida"}
            </p>
          </div>
        </div>

        {/* Data de Atualização e Status - Footer */}
        <div
          className="flex items-center justify-between pt-2 border-t border-border/50
          text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">
              {formatDate(question.updatedAt.toString())}
            </span>
          </div>

          {/* Status Indicator */}
          {question.status !== undefined && (
            <div className="flex items-center gap-1.5">
              <StatusIndicator status={question.status} />
              <span className="text-base">
                {getStatusEmoji(question.status)}
              </span>
            </div>
          )}
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
