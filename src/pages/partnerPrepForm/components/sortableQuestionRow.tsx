import { QuestionForm } from "@/types/partnerPrepForm/questionForm";
import { formatDate } from "@/utils/date";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { GripVertical } from "lucide-react";
import {
  AnswerTypeBadge,
  CollectionBadge,
  StatusBadge,
  TruncatedText,
} from "..";
import { ActionMenu } from "./actionMenu";

interface SortableQuestionRowProps {
  question: QuestionForm;
  onView: () => void;
  onDelete?: () => void;
}

export function SortableQuestionRow({
  question,
  onView,
  onDelete,
}: SortableQuestionRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-state={isDragging ? "selected" : undefined}
      className={isDragging ? "opacity-50" : undefined}
    >
      {/* Coluna de Drag Handle */}
      <TableCell
        className={`w-10 border-l-4 p-2 ${
          question.active ? "border-l-success" : "border-l-border"
        }`}
      >
        <Button
          {...attributes}
          {...listeners}
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Arrastar a questão para reordenar"
          // Sem touch-none o toque vira rolagem e o arraste é cancelado.
          className={`touch-none text-muted-foreground hover:text-primary sm:h-8 sm:w-8 ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          <GripVertical />
        </Button>
      </TableCell>

      {/* Coluna da Pergunta */}
      <TableCell className="max-w-[300px]">
        <TruncatedText text={question.text} maxLength={50} />
      </TableCell>

      {/* Coluna do Help Text */}
      <TableCell className="max-w-[200px] text-right">
        {question.helpText ? (
          <TruncatedText text={question.helpText} maxLength={30} />
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>

      {/* Coluna do Tipo */}
      <TableCell className="text-center">
        <AnswerTypeBadge answerType={question.answerType} />
      </TableCell>

      {/* Coluna da Coleção */}
      <TableCell className="text-center">
        <CollectionBadge collection={question.collection} />
      </TableCell>

      {/* Coluna do Status */}
      <TableCell className="text-center">
        <StatusBadge active={question.active} />
      </TableCell>

      {/* Coluna Criado em */}
      <TableCell className="text-right">
        <div>{formatDate(question.createdAt.toString(), "dd/MM/yyyy")}</div>
        <div className="text-caption text-muted-foreground">
          {formatDate(question.createdAt.toString(), "HH:mm")}
        </div>
      </TableCell>

      {/* Coluna Atualizado em */}
      <TableCell className="text-right">
        <div>{formatDate(question.updatedAt.toString(), "dd/MM/yyyy")}</div>
        <div className="text-caption text-muted-foreground">
          {formatDate(question.updatedAt.toString(), "HH:mm")}
        </div>
      </TableCell>

      {/* Coluna de Ações */}
      <TableCell className="w-10 text-right">
        <ActionMenu
          onView={onView}
          onDelete={onDelete}
          mensagemExclusao="Excluir esta questão?"
        />
      </TableCell>
    </TableRow>
  );
}
