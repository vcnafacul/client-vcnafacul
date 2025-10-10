// Função para renderizar cards das questões

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
import { toast } from "react-toastify";
import {
  AnswerTypeBadge,
  CollectionBadge,
  StatusBadge,
  TruncatedText,
} from "..";
import { ModalShowQuestion } from "../modals/modalShowQuestion";
import { ActionMenu } from "./actionMenu";

interface RenderQuestionsTableProps {
  questions: QuestionForm[];
  setQuestions: (questions: QuestionForm[]) => void;
}

export function RenderQuestionsTable({
  questions,
  setQuestions,
}: RenderQuestionsTableProps) {
  const [questionSelected, setQuestionSelected] = useState<QuestionForm | null>(
    null
  );
  const [isOpenModalShowQuestion, setIsOpenModalShowQuestion] =
    useState<boolean>(false);

  const {
    data: { token },
  } = useAuthStore();

  const handleViewQuestion = (question: QuestionForm) => {
    setQuestionSelected(question);
    setIsOpenModalShowQuestion(true);
  };

  const handleDeleteQuestion = (question: QuestionForm) => {
    const id = toast.loading("Excluindo questão...");
    deleteQuestion(token, question._id)
      .then(() => {
        const newQuestions = questions.filter((q) => q._id !== question._id);
        setQuestions(newQuestions);
        toast.update(id, {
          render: "Questão excluída com sucesso",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      })
      .catch((error) => {
        console.error("Erro ao excluir questão:", error);
        toast.update(id, {
          render: "Erro ao excluir questão",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
    // TODO: Implementar confirmação e exclusão
  };

  const ShowQuestion = () => {
    return isOpenModalShowQuestion ? (
      <ModalShowQuestion
        isOpen={isOpenModalShowQuestion}
        handleClose={() => setIsOpenModalShowQuestion(false)}
        question={questionSelected!}
        onToggleActive={(questionId) => {
          const newQuestions = questions.map((question) => {
            if (question._id === questionId) {
              return { ...question, active: !question.active };
            }
            return question;
          });
          setQuestions(newQuestions);
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
      <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
        <Table aria-label="questões" size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "grey.50" }}>
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
            {questions.map((question) => (
              <TableRow
                key={question._id}
                sx={{
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                  borderLeft: question.active ? "4px solid" : "4px solid",
                  borderLeftColor: question.active
                    ? "success.main"
                    : "grey.300",
                }}
              >
                <TableCell sx={{ maxWidth: 300 }}>
                  <TruncatedText text={question.text} maxLength={50} />
                </TableCell>
                <TableCell align="right" sx={{ maxWidth: 200 }}>
                  {question.helpText ? (
                    <TruncatedText text={question.helpText} maxLength={30} />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  <AnswerTypeBadge answerType={question.answerType} />
                </TableCell>
                <TableCell align="center">
                  <CollectionBadge collection={question.collection} />
                </TableCell>
                <TableCell align="center">
                  <StatusBadge active={question.active} />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    {formatDate(question.createdAt.toString(), "dd/MM/yyyy")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(question.createdAt.toString(), "HH:mm")}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    {formatDate(question.updatedAt.toString(), "dd/MM/yyyy")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(question.updatedAt.toString(), "HH:mm")}
                  </Typography>
                </TableCell>
                <TableCell align="right" className="w-10">
                  <ActionMenu
                    onView={() => handleViewQuestion(question)}
                    onDelete={() => handleDeleteQuestion(question)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ShowQuestion />
    </>
  );
}
