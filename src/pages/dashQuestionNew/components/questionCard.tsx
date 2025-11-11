import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Question } from "@/dtos/question/questionDTO";
import { StatusBadge } from "./statusBadge";

interface QuestionCardProps {
  question: Question;
  onClick: (questionId: string) => void;
}

export function QuestionCard({ question, onClick }: QuestionCardProps) {
  const truncateText = (text: string, maxLength: number = 150) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow duration-300 border-2 hover:border-primary/50"
      onClick={() => onClick(question._id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-bold">{question.title}</CardTitle>
          <StatusBadge status={question.status} />
        </div>
        <CardDescription className="text-sm">
          Questão #{question.numero}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {truncateText(question.textoQuestao)}
          </p>

          <div className="flex flex-wrap gap-2 mt-3">
            {question.imageId && (
              <Badge variant="outline" className="text-xs">
                📷 Com imagem
              </Badge>
            )}

            <Badge variant="outline" className="text-xs">
              {question.alternativa && `Resposta: ${question.alternativa}`}
            </Badge>
          </div>

          {(question.provaClassification ||
            question.subjectClassification ||
            question.textClassification ||
            question.imageClassfication ||
            question.alternativeClassfication ||
            question.reported) && (
            <div className="pt-2 border-t mt-2">
              <p className="text-xs text-amber-600 font-medium">
                ⚠️ Requer revisão
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
