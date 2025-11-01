import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { QuestionForm } from "@/types/partnerPrepForm/questionForm";
import { TableCell, TableRow, Typography, IconButton, Box } from "@mui/material";
import { formatDate } from "@/utils/date";
import {
  AnswerTypeBadge,
  CollectionBadge,
  StatusBadge,
  TruncatedText,
} from "..";
import { ActionMenu } from "./actionMenu";
import { MdDragIndicator } from "react-icons/md";

interface SortableQuestionRowProps {
  question: QuestionForm;
  onView: () => void;
  onDelete: () => void;
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
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? "rgba(25, 118, 210, 0.05)" : "transparent",
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      sx={{
        "&:hover": {
          backgroundColor: isDragging ? "rgba(25, 118, 210, 0.05)" : "action.hover",
        },
        borderLeft: question.active ? "4px solid" : "4px solid",
        borderLeftColor: question.active ? "success.main" : "grey.300",
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      {/* Coluna de Drag Handle */}
      <TableCell sx={{ width: 40, padding: "8px" }}>
        <IconButton
          {...attributes}
          {...listeners}
          size="small"
          sx={{
            cursor: "grab",
            "&:active": {
              cursor: "grabbing",
            },
            color: "grey.500",
            "&:hover": {
              color: "primary.main",
              backgroundColor: "primary.50",
            },
          }}
        >
          <MdDragIndicator size={20} />
        </IconButton>
      </TableCell>

      {/* Coluna da Pergunta */}
      <TableCell sx={{ maxWidth: 300 }}>
        <TruncatedText text={question.text} maxLength={50} />
      </TableCell>

      {/* Coluna do Help Text */}
      <TableCell align="right" sx={{ maxWidth: 200 }}>
        {question.helpText ? (
          <TruncatedText text={question.helpText} maxLength={30} />
        ) : (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        )}
      </TableCell>

      {/* Coluna do Tipo */}
      <TableCell align="center">
        <AnswerTypeBadge answerType={question.answerType} />
      </TableCell>

      {/* Coluna da Coleção */}
      <TableCell align="center">
        <CollectionBadge collection={question.collection} />
      </TableCell>

      {/* Coluna do Status */}
      <TableCell align="center">
        <StatusBadge active={question.active} />
      </TableCell>

      {/* Coluna Criado em */}
      <TableCell align="right">
        <Typography variant="body2">
          {formatDate(question.createdAt.toString(), "dd/MM/yyyy")}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatDate(question.createdAt.toString(), "HH:mm")}
        </Typography>
      </TableCell>

      {/* Coluna Atualizado em */}
      <TableCell align="right">
        <Typography variant="body2">
          {formatDate(question.updatedAt.toString(), "dd/MM/yyyy")}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatDate(question.updatedAt.toString(), "HH:mm")}
        </Typography>
      </TableCell>

      {/* Coluna de Ações */}
      <TableCell align="right" className="w-10">
        <ActionMenu onView={onView} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  );
}

