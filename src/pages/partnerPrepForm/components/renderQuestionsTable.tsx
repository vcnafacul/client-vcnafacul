// Função para renderizar cards das questões

import { useToastAsync } from "@/hooks/useToastAsync";
import { deleteQuestion } from "@/services/partnerPrepForm/deleteQuestion";
import { useAuthStore } from "@/store/auth";
import { QuestionForm } from "@/types/partnerPrepForm/questionForm";
import { formatDate } from "@/utils/date";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useState } from "react";
import {
  AnswerTypeBadge,
  CollectionBadge,
  StatusBadge,
  TruncatedText,
} from "..";
import { ModalShowQuestion } from "../modals/modalShowQuestion";
import { ActionMenu } from "./actionMenu";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableQuestionRow } from "./sortableQuestionRow";

interface RenderQuestionsTableProps {
  questions: QuestionForm[];
  allQuestions?: QuestionForm[];
  onDeleteQuestion: (questionId: string) => void;
  onChangeQuestion: (question: QuestionForm) => void;
  onReorderQuestions: (questions: QuestionForm[]) => void;
}

export function RenderQuestionsTable({
  questions,
  allQuestions = [],
  onDeleteQuestion,
  onChangeQuestion,
  onReorderQuestions,
}: RenderQuestionsTableProps) {
  const [questionSelected, setQuestionSelected] = useState<QuestionForm | null>(
    null
  );
  const [isOpenModalShowQuestion, setIsOpenModalShowQuestion] =
    useState<boolean>(false);

  const {
    data: { token },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  // Configuração dos sensores de drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Arrastar apenas após 8px de movimento
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handler para quando o arraste terminar
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q._id === active.id);
      const newIndex = questions.findIndex((q) => q._id === over.id);

      const reorderedQuestions = arrayMove(questions, oldIndex, newIndex);
      onReorderQuestions(reorderedQuestions);
    }
  };

  const handleViewQuestion = (question: QuestionForm) => {
    setQuestionSelected(question);
    setIsOpenModalShowQuestion(true);
  };

  const handleDeleteQuestion = async (question: QuestionForm) => {
    await executeAsync({
      action: () => deleteQuestion(token, question._id),
      loadingMessage: "Excluindo questão...",
      successMessage: "Questão excluída com sucesso!",
      errorMessage: "Erro ao excluir questão",
      onSuccess: () => {
        onDeleteQuestion(question._id);
      },
    });
  };

  const ShowQuestion = () => {
    return isOpenModalShowQuestion ? (
      <ModalShowQuestion
        isOpen={isOpenModalShowQuestion}
        handleClose={() => setIsOpenModalShowQuestion(false)}
        question={questionSelected!}
        availableQuestions={allQuestions}
        onToggleActive={() => {
          const newQuestion = {
            ...questionSelected!,
            active: !questionSelected!.active,
          };
          onChangeQuestion(newQuestion);
        }}
        onEdit={(question) => {
          onChangeQuestion(question);
          setQuestionSelected(question);
        }}
      />
    ) : null;
  };

  // Para mobile, renderizar como cards
  const isMobile = false; // Por enquanto sempre renderizar como tabela
  if (isMobile) {
    return (
      <>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
          {questions.map((question) => (
            <Paper
              key={question._id}
              elevation={1}
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: question.active ? "success.light" : "grey.300",
                backgroundColor: question.active
                  ? "success.50"
                  : "background.paper",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  elevation: 3,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 1,
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ flex: 1, mr: 1 }}
                >
                  <TruncatedText text={question.text} maxLength={60} />
                </Typography>
                <StatusBadge active={question.active} />
              </Box>

              {question.helpText && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  <TruncatedText text={question.helpText} maxLength={80} />
                </Typography>
              )}

              <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                <AnswerTypeBadge answerType={question.answerType} />
                <CollectionBadge collection={question.collection} />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Criado:{" "}
                  {formatDate(question.createdAt.toString(), "dd/MM/yyyy")}
                </Typography>
                <ActionMenu
                  onView={() => handleViewQuestion(question)}
                  onDelete={() => handleDeleteQuestion(question)}
                />
              </Box>
            </Paper>
          ))}
        </Box>
        <ShowQuestion />
      </>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
          <Table aria-label="questões" size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "grey.50" }}>
                <TableCell sx={{ fontWeight: "bold", width: 40 }}>
                  {/* Coluna para drag handle */}
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Pergunta</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  Help Text
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Tipo
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Coleção
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Status
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  Criado em
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  Atualizado em
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <SortableContext
                items={questions.map((q) => q._id)}
                strategy={verticalListSortingStrategy}
              >
                {questions.map((question) => (
                  <SortableQuestionRow
                    key={question._id}
                    question={question}
                    onView={() => handleViewQuestion(question)}
                    onDelete={() => handleDeleteQuestion(question)}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </TableContainer>
      </DndContext>
      <ShowQuestion />
    </>
  );
}
