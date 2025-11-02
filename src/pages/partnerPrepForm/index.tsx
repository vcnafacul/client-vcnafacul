import { TableColumn } from "@/components/organisms/expandableTable";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { deleteSection } from "@/services/partnerPrepForm/deleteSection";
import { duplicateSection } from "@/services/partnerPrepForm/duplicateSection";
import { getSection } from "@/services/partnerPrepForm/getSections";
import { setSectionActive } from "@/services/partnerPrepForm/setSectionActive";
import { useAuthStore } from "@/store/auth";
import { AnswerType, QuestionForm } from "@/types/partnerPrepForm/questionForm";
import { SectionForm } from "@/types/partnerPrepForm/sectionForm";
import {
  AppBar,
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ExpandableSection } from "./components/expandableSection";
import { ModalConfirmDuplicateSection } from "./modals/modalConfirmDuplicateSection";
import { ModalCreateQuestion } from "./modals/modalCreateQuestion";
import { ModalCreateSection } from "./modals/modalCreateSection";
import { ModalUpdateSection } from "./modals/modalUpdateSection";

type AggregatedSection = {
  section: string;
  questions: number;
};

// Componente para badge de status
export const StatusBadge = ({ active }: { active: boolean }) => (
  <Chip
    label={active ? "Ativo" : "Inativo"}
    color={active ? "success" : "default"}
    size="small"
    variant={active ? "filled" : "outlined"}
    sx={{
      fontWeight: 500,
      fontSize: "0.75rem",
    }}
  />
);

// Componente para badge de tipo de resposta
export const AnswerTypeBadge = ({ answerType }: { answerType: AnswerType }) => {
  const getColor = (type: AnswerType) => {
    switch (type) {
      case AnswerType.Text:
        return "primary";
      case AnswerType.Number:
        return "secondary";
      case AnswerType.Boolean:
        return "warning";
      case AnswerType.Options:
        return "info";
      default:
        return "default";
    }
  };

  const getLabel = (type: AnswerType) => {
    switch (type) {
      case AnswerType.Text:
        return "Texto";
      case AnswerType.Number:
        return "Número";
      case AnswerType.Boolean:
        return "Sim/Não";
      case AnswerType.Options:
        return "Opções";
      default:
        return type;
    }
  };

  return (
    <Chip
      label={getLabel(answerType)}
      color={getColor(answerType)}
      size="small"
      variant="outlined"
      sx={{
        fontWeight: 500,
        fontSize: "0.75rem",
      }}
    />
  );
};

// Componente para badge de coleção
export const CollectionBadge = ({ collection }: { collection: string }) => (
  <Chip
    label={collection === "single" ? "Única" : "Múltipla"}
    color={collection === "single" ? "success" : "info"}
    size="small"
    variant="outlined"
    sx={{
      fontWeight: 500,
      fontSize: "0.75rem",
    }}
  />
);

// Componente para texto truncado com tooltip
export const TruncatedText = ({
  text,
  maxLength = 50,
}: {
  text: string;
  maxLength?: number;
}) => {
  const truncated =
    text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

  if (text.length <= maxLength) {
    return <span>{text}</span>;
  }

  return (
    <Tooltip title={text} arrow placement="top">
      <span style={{ cursor: "help", textDecoration: "underline dotted" }}>
        {truncated}
      </span>
    </Tooltip>
  );
};

export default function PartnerPrepForm() {
  const {
    data: { token },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  const [entities, setEntities] = useState<SectionForm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sectionSelected, setSectionSelected] = useState<SectionForm | null>(
    null
  );

  const modals = useModals([
    "modalCreateQuestion",
    "modalCreateSection",
    "modalUpdateSection",
    "modalConfirmDuplicate",
  ]);

  const columns: TableColumn<AggregatedSection>[] = [
    { key: "section", label: "Seção" },
    { key: "questions", label: "Total", align: "right" },
    { key: "active", label: "Ativas", align: "right" },
    { key: "createdAt", label: "Criado em", align: "right" },
    { key: "updatedAt", label: "Atualizado em", align: "right" },
    { key: "action", label: "Ações", align: "center" },
  ];

  const handleGetSections = async () => {
    setLoading(true);
    getSection(token)
      .then((res) => {
        setEntities(res.data);
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    handleGetSections();
  }, [token]);

  // Componente de loading skeleton
  const LoadingSkeleton = () => (
    <Box sx={{ p: 2 }}>
      {[...Array(3)].map((_, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Skeleton
            variant="rectangular"
            height={60}
            sx={{ borderRadius: 2 }}
          />
        </Box>
      ))}
    </Box>
  );

  // Componente de estado vazio
  const EmptyState = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
        px: 4,
        textAlign: "center",
      }}
    >
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Nenhuma seção encontrada
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Comece criando sua primeira seção de formulário
      </Typography>
    </Box>
  );

  const CreateQuestion = () => {
    // Coletar todas as questões de todas as seções para referência
    const allQuestions = entities.flatMap((section) => section.questions);

    return modals.modalCreateQuestion.isOpen ? (
      <ModalCreateQuestion
        isOpen={modals.modalCreateQuestion.isOpen}
        handleClose={() => modals.modalCreateQuestion.close()}
        sectionId={sectionSelected!._id}
        availableQuestions={allQuestions}
        onSuccess={(question: QuestionForm) => {
          // eu preciso colocar a questão na seção correta
          const newEntities = entities.map((section) => {
            if (section._id === sectionSelected!._id) {
              return {
                ...section,
                questions: [...section.questions, question],
              };
            }
            return section;
          });
          setEntities(newEntities);
          modals.modalCreateQuestion.close();
        }}
      />
    ) : null;
  };

  const handleAddQuestion = (sectionId: string) => {
    setSectionSelected(entities.find((e) => e._id === sectionId)!);
    modals.modalCreateQuestion.open();
  };

  const handleCreateSection = () => {
    modals.modalCreateSection.open();
  };

  const handleDeleteSection = async (sectionId: string) => {
    await executeAsync({
      action: () => deleteSection(token, sectionId),
      loadingMessage: "Excluindo seção...",
      successMessage: "Seção excluída com sucesso!",
      errorMessage: (error: Error) => `Erro ao excluir seção: ${error.message}`,
      onSuccess: () => {
        setEntities((prev) => prev.filter((e) => e._id !== sectionId));
      },
    });
  };

  const handleToggleSection = async (sectionId: string) => {
    const section = entities.find((e) => e._id === sectionId);
    if (!section) return;

    const newActiveState = !section.active;
    const action = newActiveState ? "ativando" : "desativando";
    const successMessage = newActiveState ? "ativada" : "desativada";

    await executeAsync({
      action: () => setSectionActive(token, sectionId),
      loadingMessage: `${
        action.charAt(0).toUpperCase() + action.slice(1)
      } seção...`,
      successMessage: `Seção ${successMessage} com sucesso`,
      errorMessage: `Erro ao ${action} seção`,
      onSuccess: () => {
        setEntities((prev) =>
          prev.map((e) =>
            e._id === sectionId ? { ...e, active: newActiveState } : e
          )
        );
      },
    });
  };

  const handleOpenDuplicateModal = (sectionId: string) => {
    const section = entities.find((e) => e._id === sectionId);
    if (section) {
      setSectionSelected(section);
      modals.modalConfirmDuplicate.open();
    }
  };

  const handleConfirmDuplicate = async () => {
    if (!sectionSelected) return;

    await executeAsync({
      action: () => duplicateSection(sectionSelected._id, token),
      loadingMessage: "Duplicando seção...",
      successMessage: "Seção duplicada com sucesso!",
      errorMessage: "Erro ao duplicar seção",
      onSuccess: () => {
        modals.modalConfirmDuplicate.close();
        // Recarregar todas as seções
        setLoading(true);
        handleGetSections();
      },
    });
  };

  const CreateSection = () => {
    return modals.modalCreateSection.isOpen ? (
      <ModalCreateSection
        isOpen={modals.modalCreateSection.isOpen}
        handleClose={() => modals.modalCreateSection.close()}
        onSuccess={(section: SectionForm) => {
          setEntities((prev) => [...prev, section]);
          modals.modalCreateSection.close();
        }}
      />
    ) : null;
  };

  const UpdateSection = () => {
    return modals.modalUpdateSection.isOpen ? (
      <ModalUpdateSection
        isOpen={modals.modalUpdateSection.isOpen}
        handleClose={() => modals.modalUpdateSection.close()}
        section={sectionSelected!}
        onSuccess={(section: SectionForm) => {
          setEntities((prev) =>
            prev.map((e) => (e._id === section._id ? section : e))
          );
        }}
      />
    ) : null;
  };

  const DuplicateSection = () => {
    return modals.modalConfirmDuplicate.isOpen ? (
      <ModalConfirmDuplicateSection
        isOpen={modals.modalConfirmDuplicate.isOpen}
        handleClose={() => modals.modalConfirmDuplicate.close()}
        handleConfirm={handleConfirmDuplicate}
        sectionName={sectionSelected!.name}
      />
    ) : null;
  };

  if (loading) {
    return (
      <>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h4" fontWeight="bold" className="text-marine">
              Formulários de Preparação
            </Typography>
          </Toolbar>
        </AppBar>
        <Box p={0}>
          <Typography
            variant="h6"
            gutterBottom
            component="div"
            className="pl-5"
          >
            Seções
          </Typography>
          <LoadingSkeleton />
        </Box>
      </>
    );
  }

  if (entities.length === 0) {
    return (
      <>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h4" fontWeight="bold" className="text-marine">
              Formulários de Preparação
            </Typography>
          </Toolbar>
        </AppBar>
        <div className="flex justify-end items-center w-full">
          {/* criar um header para por um botão de criação de seção */}
          <Box p={0}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => modals.modalCreateSection.open()}
            >
              Criar Seção
            </Button>
          </Box>
        </div>
        <br />
        <Box p={0}>
          <Typography
            variant="h6"
            gutterBottom
            component="div"
            className="pl-5"
          >
            Seções
          </Typography>
          <EmptyState />
        </Box>
        <CreateSection />
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h4" fontWeight="bold" className="text-marine">
            Formulários de Preparação
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateSection}
            sx={{ ml: 2 }}
          >
            Nova Seção
          </Button>
        </Toolbar>
      </AppBar>

      <Box p={0}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            px: 2,
          }}
        >
          <Typography variant="h6" gutterBottom component="div">
            Seções ({entities.length})
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Total de questões:{" "}
              {entities.reduce(
                (acc, section) => acc + section.questions.length,
                0
              )}
            </Typography>
            <Typography variant="body2" color="success.main">
              • Ativas:{" "}
              {entities.reduce((acc, section) => {
                if (section.active) {
                  return acc + section.questions.filter((q) => q.active).length;
                }
                return acc;
              }, 0)}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TableContainer
              component={Paper}
              elevation={2}
              sx={{ borderRadius: 2 }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "primary.50" }}>
                    <TableCell size="small" className="w-5" />
                    {columns.map((column) => (
                      <TableCell
                        size="small"
                        key={column.key as string}
                        align={column.align || "left"}
                        sx={{ fontWeight: "bold", color: "primary.main" }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entities.map((entity) => {
                    // Coletar todas as questões de todas as seções para referência
                    const allQuestions = entities.flatMap(
                      (section) => section.questions
                    );

                    return (
                      <ExpandableSection
                        key={entity._id}
                        section={entity}
                        allQuestions={allQuestions}
                        setSection={(section) => {
                          setEntities((prev) =>
                            prev.map((e) =>
                              e._id === section._id ? section : e
                            )
                          );
                        }}
                        handleAddQuestion={handleAddQuestion}
                        handleEditSection={() => {
                          setSectionSelected(entity);
                          modals.modalUpdateSection.open();
                        }}
                        handleDeleteSection={handleDeleteSection}
                        handleToggleSection={handleToggleSection}
                        handleDuplicateSection={handleOpenDuplicateModal}
                      />
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Box>
      <CreateQuestion />
      <CreateSection />
      <UpdateSection />
      <DuplicateSection />
    </>
  );
}
