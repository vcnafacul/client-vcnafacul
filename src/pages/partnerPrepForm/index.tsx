import { TableColumn } from "@/components/organisms/expandableTable";
import { deleteSection } from "@/services/partnerPrepForm/deleteSection";
import { getSection } from "@/services/partnerPrepForm/getSections";
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
  const [entities, setEntities] = useState<SectionForm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOpenCreateQuestion, setIsOpenCreateQuestion] =
    useState<boolean>(false);
  const [isOpenCreateSection, setIsOpenCreateSection] =
    useState<boolean>(false);
  const [sectionSelected, setSectionSelected] = useState<SectionForm | null>(
    null
  );
  const [isOpenUpdateSection, setIsOpenUpdateSection] =
    useState<boolean>(false);

  const columns: TableColumn<AggregatedSection>[] = [
    { key: "section", label: "Seção" },
    { key: "questions", label: "Total", align: "right" },
    { key: "active", label: "Ativas", align: "right" },
    { key: "createdAt", label: "Criado em", align: "right" },
    { key: "updatedAt", label: "Atualizado em", align: "right" },
    { key: "action", label: "Ações", align: "center" },
  ];

  useEffect(() => {
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
    return isOpenCreateQuestion ? (
      <ModalCreateQuestion
        isOpen={isOpenCreateQuestion}
        handleClose={() => setIsOpenCreateQuestion(false)}
        sectionId={sectionSelected!._id}
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
          setIsOpenCreateQuestion(false);
        }}
      />
    ) : null;
  };

  const handleAddQuestion = (sectionId: string) => {
    setSectionSelected(entities.find((e) => e._id === sectionId)!);
    setIsOpenCreateQuestion(true);
  };

  const handleCreateSection = () => {
    setIsOpenCreateSection(true);
  };

  const handleDeleteSection = (sectionId: string) => {
    const id = toast.loading("Excluindo seção...");
    deleteSection(token, sectionId)
      .then(() => {
        setEntities((prev) => prev.filter((e) => e._id !== sectionId));
        toast.update(id, {
          render: "Seção excluída com sucesso",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      })
      .catch((error: Error) => {
        toast.update(id, {
          render: `Erro ao excluir seção: ${error.message}`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  const CreateSection = () => {
    return isOpenCreateSection ? (
      <ModalCreateSection
        isOpen={isOpenCreateSection}
        handleClose={() => setIsOpenCreateSection(false)}
        onSuccess={(section: SectionForm) => {
          setEntities((prev) => [...prev, section]);
          setIsOpenCreateSection(false);
        }}
      />
    ) : null;
  };

  const UpdateSection = () => {
    return isOpenUpdateSection ? (
      <ModalUpdateSection
        isOpen={isOpenUpdateSection}
        handleClose={() => setIsOpenUpdateSection(false)}
        section={sectionSelected!}
        onSuccess={(section: SectionForm) => {
          setEntities((prev) =>
            prev.map((e) => (e._id === section._id ? section : e))
          );
        }}
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
              onClick={() => setIsOpenCreateSection(true)}
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
              {entities.reduce(
                (acc, section) =>
                  acc + section.questions.filter((q) => q.active).length,
                0
              )}
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
                      setSection={(section) => {
                        setEntities((prev) =>
                          prev.map((e) => (e._id === section._id ? section : e))
                        );
                      }}
                      handleAddQuestion={handleAddQuestion}
                      handleEditSection={() => {
                        setSectionSelected(entity);
                        setIsOpenUpdateSection(true);
                      }}
                      handleDeleteSection={handleDeleteSection}
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
    </>
  );
}
