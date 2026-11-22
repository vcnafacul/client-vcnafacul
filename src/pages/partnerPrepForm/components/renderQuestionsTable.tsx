import { motivoDoErro } from "../motivoDoErro";
// Função para renderizar cards das questões

import { useToastAsync } from "@/hooks/useToastAsync";
import { deleteQuestion } from "@/services/partnerPrepForm/deleteQuestion";
import { useAuthStore } from "@/store/auth";
import { QuestionForm } from "@/types/partnerPrepForm/questionForm";
import { formatDate } from "@/utils/date";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAcimaDeSm } from "@/components/dashV2/useAcimaDeSm";
import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
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
  deleteFn?: (token: string, id: string) => Promise<void>;
  toggleActiveFn?: (token: string, id: string) => Promise<void>;
  updateQuestionFn?: (token: string, id: string, question: QuestionForm) => Promise<void>;
  readOnly?: boolean;
}

export function RenderQuestionsTable({
  questions,
  allQuestions = [],
  onDeleteQuestion,
  onChangeQuestion,
  onReorderQuestions,
  deleteFn = deleteQuestion,
  toggleActiveFn,
  updateQuestionFn,
  readOnly = false,
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
  // Abaixo de 768px (o `sm` do projeto): cards, e ↑/↓ no lugar do arrastar.
  const isMobile = !useAcimaDeSm();

  const mover = (indice: number, destino: number) => {
    if (destino < 0 || destino >= questions.length) return;
    onReorderQuestions(arrayMove(questions, indice, destino));
  };

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
    if (readOnly) return;
    await executeAsync({
      action: () => deleteFn(token, question._id),
      loadingMessage: "Excluindo questão...",
      successMessage: "Questão excluída com sucesso!",
      errorMessage: (e: unknown) => motivoDoErro(e, "Erro ao excluir questão"),
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
        toggleActiveFn={toggleActiveFn}
        updateFn={updateQuestionFn}
        readOnly={readOnly}
      />
    ) : null;
  };

  // Para mobile, renderizar como cards
  if (isMobile) {
    return (
      <>
        <TooltipProvider delayDuration={200}>
          <div className="flex flex-col gap-4">
            {questions.map((question, indice) => (
              <Card
                key={question._id}
                className={`p-4 ${
                  question.active ? "border-success" : "border-border"
                }`}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="min-w-0 flex-1 break-words text-label font-bold">
                    <TruncatedText text={question.text} maxLength={60} />
                  </p>
                  <StatusBadge active={question.active} />
                </div>

                {question.helpText && (
                  <p className="mb-2 text-body text-muted-foreground">
                    <TruncatedText text={question.helpText} maxLength={80} />
                  </p>
                )}

                <div className="mb-2 flex flex-wrap gap-2">
                  <AnswerTypeBadge answerType={question.answerType} />
                  <CollectionBadge collection={question.collection} />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-caption text-muted-foreground">
                    Criado:{" "}
                    {formatDate(question.createdAt.toString(), "dd/MM/yyyy")}
                  </span>
                  <div className="flex items-center">
                    {!readOnly && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="Mover para cima"
                              disabled={indice === 0}
                              onClick={() => mover(indice, indice - 1)}
                            >
                              <ArrowUp />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Mover para cima</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="Mover para baixo"
                              disabled={indice === questions.length - 1}
                              onClick={() => mover(indice, indice + 1)}
                            >
                              <ArrowDown />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Mover para baixo</TooltipContent>
                        </Tooltip>
                      </>
                    )}
                    <ActionMenu
                      tamanho="medium"
                      onView={() => handleViewQuestion(question)}
                      onDelete={
                        readOnly
                          ? undefined
                          : () => handleDeleteQuestion(question)
                      }
                      mensagemExclusao="Excluir esta questão?"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TooltipProvider>
        {ShowQuestion()}
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
        <Card>
          <Table aria-label="questões">
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="w-10">
                  <span className="sr-only">Arrastar para ordenar</span>
                </TableHead>
                <TableHead>Pergunta</TableHead>
                <TableHead className="text-right">Help Text</TableHead>
                <TableHead className="text-center">Tipo</TableHead>
                <TableHead className="text-center">Coleção</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Criado em</TableHead>
                <TableHead className="text-right">Atualizado em</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
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
                    onDelete={readOnly ? undefined : () => handleDeleteQuestion(question)}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </Card>
      </DndContext>
      {ShowQuestion()}
    </>
  );
}
