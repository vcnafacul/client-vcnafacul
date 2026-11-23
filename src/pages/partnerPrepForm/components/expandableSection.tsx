import { QuestionForm } from "@/types/partnerPrepForm/questionForm";
import { SectionForm } from "@/types/partnerPrepForm/sectionForm";
import { formatDate } from "@/utils/date";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge as StatusBadgeUi } from "@/components/ui/status-badge";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { StatusBadge } from "..";
import { ActionMenu } from "./actionMenu";
import { RenderQuestionsTable } from "./renderQuestionsTable";
import { useQuestoesDaSecao } from "./useQuestoesDaSecao";

export interface ExpandableSectionProps {
  section: SectionForm;
  allQuestions?: QuestionForm[];
  setSection: (section: SectionForm) => void;
  handleAddQuestion: (id: string) => void;
  handleEditSection: (id: string) => void;
  handleDeleteSection: (id: string) => void;
  handleToggleSection: (id: string) => void;
  handleReorderQuestions: (
    sectionId: string,
    questions: QuestionForm[]
  ) => void;
  handleDuplicateSection: (id: string) => void;
  deleteFn?: (token: string, id: string) => Promise<void>;
  toggleActiveFn?: (token: string, id: string) => Promise<void>;
  updateQuestionFn?: (token: string, id: string, question: QuestionForm) => Promise<void>;
}

export function ExpandableSection({
  section,
  allQuestions = [],
  setSection,
  handleAddQuestion,
  handleEditSection,
  handleDeleteSection,
  handleToggleSection,
  handleReorderQuestions,
  handleDuplicateSection,
  deleteFn,
  toggleActiveFn,
  updateQuestionFn,
}: ExpandableSectionProps) {
  const [open, setOpen] = useState<boolean>(false);
  const idDetalhes = useId();
  const rotulo = open ? "Recolher" : "Expandir";

  const activeQuestionsCount = section.questions.filter(
    (question) => question.active
  ).length;
  const totalQuestionsCount = section.questions.length;

  const { onDeleteQuestion, onChangeQuestion } = useQuestoesDaSecao(
    section,
    setSection,
    () => setOpen(false),
  );

  return (
    <>
      <TableRow
        key={section._id}
        data-state={open ? "selected" : undefined}
        className={`hover:bg-accent ${
          section.active ? "" : "bg-muted opacity-60"
        }`.trim()}
      >
        <TableCell
          className={`w-16 border-l-4 ${
            section.isGlobal
              ? "border-l-chart-6"
              : section.active
                ? "border-l-primary"
                : "border-l-border"
          }`}
        >
          {section.questions.length > 0 && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`${rotulo} questões de ${section.name}`}
                    aria-expanded={open}
                    aria-controls={open ? idDetalhes : undefined}
                    onClick={() => setOpen(!open)}
                    className="sm:h-8 sm:w-8"
                  >
                    <ChevronDown
                      className={`transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{rotulo}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-body font-bold">{section.name}</span>
            <StatusBadge active={section.active} />
            {section.isGlobal && <Badge variant="secondary">Global</Badge>}
          </div>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex flex-col items-end">
            <span className="text-body font-bold">{totalQuestionsCount}</span>
            <span className="text-caption text-muted-foreground">total</span>
          </div>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex flex-col items-end">
            <span className="text-body font-bold text-success">
              {activeQuestionsCount}
            </span>
            <span className="text-caption text-muted-foreground">ativas</span>
          </div>
        </TableCell>
        <TableCell className="text-right">
          <div>{formatDate(section.createdAt.toString(), "dd/MM/yyyy")}</div>
          <div className="text-caption text-muted-foreground">
            {formatDate(section.createdAt.toString(), "HH:mm")}
          </div>
        </TableCell>
        <TableCell className="text-right">
          <div>{formatDate(section.updatedAt.toString(), "dd/MM/yyyy")}</div>
          <div className="text-caption text-muted-foreground">
            {formatDate(section.updatedAt.toString(), "HH:mm")}
          </div>
        </TableCell>
        <TableCell className="w-10 text-right">
          {section.isGlobal ? (
            <span className="text-caption text-muted-foreground">
              Somente leitura
              <span className="sr-only"> (seção global)</span>
            </span>
          ) : (
            <ActionMenu
              onAdd={() => {
                handleAddQuestion(section._id);
              }}
              onEdit={() => handleEditSection(section._id)}
              onDuplicate={() => handleDuplicateSection(section._id)}
              onDelete={
                totalQuestionsCount > 0
                  ? undefined
                  : () => handleDeleteSection(section._id)
              }
              onToggle={() => handleToggleSection(section._id)}
              isActive={section.active}
              mensagemExclusao={`Excluir a seção ${section.name}?`}
            />
          )}
        </TableCell>
      </TableRow>
      {open && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={7} className="py-0">
            <div id={idDetalhes} className="m-2">
              <h4 className="mb-2 flex items-center gap-2 text-h4 font-bold text-primary">
                Questões ({totalQuestionsCount})
                {activeQuestionsCount !== totalQuestionsCount && (
                  <StatusBadgeUi variant="success" look="dot">
                    {activeQuestionsCount} ativas
                  </StatusBadgeUi>
                )}
              </h4>
              <RenderQuestionsTable
                questions={section.questions}
                allQuestions={allQuestions}
                onDeleteQuestion={onDeleteQuestion}
                onChangeQuestion={onChangeQuestion}
                onReorderQuestions={(reorderedQuestions) =>
                  handleReorderQuestions(section._id, reorderedQuestions)
                }
                deleteFn={deleteFn}
                toggleActiveFn={toggleActiveFn}
                updateQuestionFn={updateQuestionFn}
                readOnly={section.isGlobal}
              />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
