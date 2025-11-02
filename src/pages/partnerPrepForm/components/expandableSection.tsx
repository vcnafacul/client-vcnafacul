import { QuestionForm } from "@/types/partnerPrepForm/questionForm";
import { SectionForm } from "@/types/partnerPrepForm/sectionForm";
import { formatDate } from "@/utils/date";
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { StatusBadge } from "..";
import { ActionMenu } from "./actionMenu";
import { RenderQuestionsTable } from "./renderQuestionsTable";

interface ExpandableSectionProps {
  section: SectionForm;
  allQuestions?: QuestionForm[];
  setSection: (section: SectionForm) => void;
  handleAddQuestion: (id: string) => void;
  handleEditSection: (id: string) => void;
  handleDeleteSection: (id: string) => void;
  handleToggleSection: (id: string) => void;
  handleDuplicateSection: (id: string) => void;
}

export function ExpandableSection({
  section,
  allQuestions = [],
  setSection,
  handleAddQuestion,
  handleEditSection,
  handleDeleteSection,
  handleToggleSection,
  handleDuplicateSection,
}: ExpandableSectionProps) {
  const [open, setOpen] = useState<boolean>(false);

  const activeQuestionsCount = section.questions.filter(
    (question) => question.active
  ).length;
  const totalQuestionsCount = section.questions.length;

  const onDeleteQuestion = (questionId: string) => {
    const newQuestions = section.questions.filter((q) => q._id !== questionId);
    section.questions = newQuestions;
    setSection(section);
    if (newQuestions.length === 0) {
      setOpen(false);
    }
  };

  const onChangeQuestion = (question: QuestionForm) => {
    section.questions = section.questions.map((q) =>
      q._id === question._id ? question : q
    );
    setSection(section);
  };

  return (
    <>
      <TableRow
        key={section._id}
        sx={{
          opacity: section.active ? 1 : 0.6,
          backgroundColor: open
            ? "action.selected"
            : section.active
            ? "transparent"
            : "grey.50",
          "&:hover": {
            backgroundColor: section.active ? "action.hover" : "grey.100",
          },
          borderLeft: "4px solid",
          borderLeftColor: section.active ? "primary.main" : "grey.300",
        }}
      >
        <TableCell size="small" className="w-16">
          {section.questions.length > 0 && (
            <Tooltip title={open ? "Recolher" : "Expandir"} arrow>
              <IconButton
                aria-label="expand row"
                size="small"
                onClick={() => setOpen(!open)}
                sx={{
                  transition: "transform 0.2s ease-in-out",
                  transform: open ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <FiChevronDown className="w-5 h-5" />
              </IconButton>
            </Tooltip>
          )}
        </TableCell>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {section.name}
            </Typography>
            <StatusBadge active={section.active} />
          </Box>
        </TableCell>
        <TableCell align="right">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              {totalQuestionsCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              total
            </Typography>
          </Box>
        </TableCell>
        <TableCell align="right">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <Typography variant="body2" fontWeight="bold" color="success.main">
              {activeQuestionsCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ativas
            </Typography>
          </Box>
        </TableCell>
        <TableCell align="right">
          <Typography variant="body2">
            {formatDate(section.createdAt.toString(), "dd/MM/yyyy")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDate(section.createdAt.toString(), "HH:mm")}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="body2">
            {formatDate(section.updatedAt.toString(), "dd/MM/yyyy")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDate(section.updatedAt.toString(), "HH:mm")}
          </Typography>
        </TableCell>
        <TableCell align="right" className="w-10">
          <ActionMenu
            onAdd={
              section.active
                ? () => {
                    console.log("handleAddQuestion", section._id);
                    handleAddQuestion(section._id);
                  }
                : undefined
            }
            onEdit={() => handleEditSection(section._id)}
            onDuplicate={() => handleDuplicateSection(section._id)}
            onDelete={
              totalQuestionsCount > 0
                ? undefined
                : () => handleDeleteSection(section._id)
            }
            onToggle={() => handleToggleSection(section._id)}
            isActive={section.active}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  component="div"
                  sx={{
                    fontWeight: "bold",
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  Questões ({totalQuestionsCount})
                  {activeQuestionsCount !== totalQuestionsCount && (
                    <Chip
                      label={`${activeQuestionsCount} ativas`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Typography>
              </Box>
              <RenderQuestionsTable
                questions={section.questions}
                allQuestions={allQuestions}
                onDeleteQuestion={onDeleteQuestion}
                onChangeQuestion={onChangeQuestion}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
