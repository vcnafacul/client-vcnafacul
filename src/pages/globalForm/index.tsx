import { TableColumn } from "@/components/organisms/expandableTable";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { createGlobalQuestion } from "@/services/adminForm/createGlobalQuestion";
import { createGlobalSection } from "@/services/adminForm/createGlobalSection";
import { deleteGlobalQuestion } from "@/services/adminForm/deleteGlobalQuestion";
import { deleteGlobalSection } from "@/services/adminForm/deleteGlobalSection";
import { duplicateGlobalSection } from "@/services/adminForm/duplicateGlobalSection";
import { getGlobalSections } from "@/services/adminForm/getGlobalSections";
import { reorderGlobalQuestions } from "@/services/adminForm/reorderGlobalQuestions";
import { setGlobalQuestionActive } from "@/services/adminForm/setGlobalQuestionActive";
import { setGlobalSectionActive } from "@/services/adminForm/setGlobalSectionActive";
import { updateGlobalQuestion } from "@/services/adminForm/updateGlobalQuestion";
import { updateGlobalSection } from "@/services/adminForm/updateGlobalSection";
import { useAuthStore } from "@/store/auth";
import { QuestionForm } from "@/types/partnerPrepForm/questionForm";
import { SectionForm } from "@/types/partnerPrepForm/sectionForm";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ExpandableSection } from "../partnerPrepForm/components/expandableSection";
import { ModalConfirmDuplicateSection } from "../partnerPrepForm/modals/modalConfirmDuplicateSection";
import { ModalCreateQuestion } from "../partnerPrepForm/modals/modalCreateQuestion";
import { ModalCreateSection } from "../partnerPrepForm/modals/modalCreateSection";
import { ModalUpdateSection } from "../partnerPrepForm/modals/modalUpdateSection";

type AggregatedSection = {
  section: string;
  questions: number;
};

export default function GlobalFormPage() {
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

  const allQuestions = useMemo(() => {
    return entities.flatMap((section) => section.questions);
  }, [entities]);

  const handleSetSection = useCallback((section: SectionForm) => {
    setEntities((prev) =>
      prev.map((e) => (e._id === section._id ? section : e))
    );
  }, []);

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
    getGlobalSections(token)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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
        Comece criando a primeira seção do formulário global
      </Typography>
    </Box>
  );

  const CreateQuestion = () => {
    return modals.modalCreateQuestion.isOpen ? (
      <ModalCreateQuestion
        isOpen={modals.modalCreateQuestion.isOpen}
        handleClose={() => modals.modalCreateQuestion.close()}
        sectionId={sectionSelected!._id}
        availableQuestions={allQuestions}
        createFn={createGlobalQuestion}
        onSuccess={(question: QuestionForm) => {
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
      action: () => deleteGlobalSection(token, sectionId),
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
      action: () => setGlobalSectionActive(token, sectionId),
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

  const handleReorderQuestions = async (
    sectionId: string,
    reorderedQuestions: QuestionForm[]
  ) => {
    setEntities((prev) =>
      prev.map((section) =>
        section._id === sectionId
          ? { ...section, questions: reorderedQuestions }
          : section
      )
    );

    const questionIds = reorderedQuestions.map((q) => q._id);

    await executeAsync({
      action: () => reorderGlobalQuestions(token, sectionId, questionIds),
      loadingMessage: "Reordenando questões...",
      successMessage: "Questões reordenadas com sucesso!",
      errorMessage: "Erro ao reordenar questões",
      onError: () => {
        const originalSection = entities.find((e) => e._id === sectionId);
        if (originalSection) {
          setEntities((prev) =>
            prev.map((section) =>
              section._id === sectionId ? originalSection : section
            )
          );
        }
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
      action: () => duplicateGlobalSection(sectionSelected._id, token),
      loadingMessage: "Duplicando seção...",
      successMessage: "Seção duplicada com sucesso!",
      errorMessage: "Erro ao duplicar seção",
      onSuccess: () => {
        modals.modalConfirmDuplicate.close();
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
        createFn={createGlobalSection}
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
        updateFn={updateGlobalSection}
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

  const PageHeader = () => (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h4" fontWeight="bold" className="text-marine">
          Formulário Global
        </Typography>
        {!loading && entities.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateSection}
            sx={{ ml: 2 }}
          >
            Nova Seção
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );

  if (loading) {
    return (
      <>
        <PageHeader />
        <Alert severity="info" sx={{ mx: 2, mb: 2 }}>
          Este formulário é incluído em todos os processos seletivos.
        </Alert>
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
        <PageHeader />
        <Alert severity="info" sx={{ mx: 2, mb: 2 }}>
          Este formulário é incluído em todos os processos seletivos.
        </Alert>
        <div className="flex justify-end items-center w-full">
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
      <PageHeader />

      <Alert severity="info" sx={{ mx: 2, mb: 2 }}>
        Este formulário é incluído em todos os processos seletivos.
      </Alert>

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
                  {entities.map((entity) => (
                    <ExpandableSection
                      key={entity._id}
                      section={entity}
                      allQuestions={allQuestions}
                      setSection={handleSetSection}
                      handleAddQuestion={handleAddQuestion}
                      handleEditSection={() => {
                        setSectionSelected(entity);
                        modals.modalUpdateSection.open();
                      }}
                      handleDeleteSection={handleDeleteSection}
                      handleToggleSection={handleToggleSection}
                      handleReorderQuestions={handleReorderQuestions}
                      handleDuplicateSection={handleOpenDuplicateModal}
                      deleteFn={deleteGlobalQuestion}
                      toggleActiveFn={setGlobalQuestionActive}
                      updateQuestionFn={updateGlobalQuestion}
                    />
                  ))}
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
