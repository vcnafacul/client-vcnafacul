import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToastAsync } from "@/hooks/useToastAsync";
import {
  CoursePeriodEntity,
  CoursePeriodOutput,
  createCoursePeriod,
} from "@/services/prepCourse/coursePeriod/createCoursePeriod";
import { deleteCoursePeriod } from "@/services/prepCourse/coursePeriod/deleteCoursePeriod";
import { getCoursePeriods } from "@/services/prepCourse/coursePeriod/getCoursePeriods";
import { updateCoursePeriod } from "@/services/prepCourse/coursePeriod/updateCoursePeriod";
import { useAuthStore } from "@/store/auth";
import { ClassEntity } from "@/types/partnerPrepCourse/classEntity";
import { Paginate } from "@/utils/paginate";
import {
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
import { useEffect, useState } from "react";
import { ExpandableCoursePeriod } from "./components/expandableCoursePeriod";
import { ClassCreateEditModal } from "./modals/classCreateEditModal";
import { CoursePeriodCreateEditModal } from "./modals/coursePeriodCreateEditModal";
import { useModals } from "@/hooks/useModal";

export function PartnerClass() {
  const [entities, setEntities] = useState<CoursePeriodEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [limit] = useState<number>(10);
  const [classSelected, setClassSelected] = useState<ClassEntity | undefined>(
    undefined
  );

  const {
    data: { token },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  const [coursePeriodSelected, setCoursePeriodSelected] =
    useState<CoursePeriodEntity | null>(null);
  
  const modals = useModals([
    'modalCreateCoursePeriod',
    'modalEditCoursePeriod',
    'modalCreateClass',
  ]);

  const columns = [
    { key: "coursePeriod", label: "Período Letivo" },
    { key: "classes", label: "Total", align: "right" as const },
    { key: "year", label: "Ano", align: "right" as const },
    { key: "startDate", label: "Início", align: "right" as const },
    { key: "endDate", label: "Fim", align: "right" as const },
    { key: "action", label: "Ações", align: "center" as const },
  ];

  // Mock data para desenvolvimento
  useEffect(() => {
    setLoading(true);

    // Simular delay da API
    setTimeout(async () => {
      await executeAsync({
        action: () => getCoursePeriods(token, currentPage, limit),
        loadingMessage: "Buscando períodos letivos...",
        successMessage: "Períodos letivos buscados com sucesso!",
        errorMessage: (error: Error) => error.message,
        onSuccess: (res: Paginate<CoursePeriodEntity>) => {
          setEntities(res.data);
          setTotalItems(res.totalItems);
          setLoading(false);
        },
      });
    }, 1000);
  }, [currentPage, limit, token]);

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
        Nenhum período letivo encontrado
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Comece criando seu primeiro período letivo
      </Typography>
    </Box>
  );

  // Handlers para modais
  const handleCreateCoursePeriod = () => {
    modals.modalCreateCoursePeriod.open();
  };

  const handleSuccessCreateCoursePeriod = async (dto: CoursePeriodOutput) => {
    await executeAsync({
      action: () => createCoursePeriod(token, dto),
      loadingMessage: "Criando período letivo...",
      successMessage: "Período letivo criado com sucesso!",
      errorMessage: (error: Error) => error.message,
      onSuccess: (res: CoursePeriodEntity) => {
        setEntities((prev) => [...prev, res]);
      },
    });
  };

  const handleEditCoursePeriod = (coursePeriodId: string) => {
    const coursePeriod = entities.find((e) => e.id === coursePeriodId);
    if (coursePeriod) {
      setCoursePeriodSelected(coursePeriod);
      modals.modalEditCoursePeriod.open();
    }
  };

  const handleSuccessEditCoursePeriod = async (
    dto: CoursePeriodOutput & { id: string }
  ) => {
    await executeAsync({
      action: () => updateCoursePeriod(token, dto),
      loadingMessage: "Editando período letivo...",
      successMessage: "Período letivo editado com sucesso!",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => {
        setEntities((prev) =>
          prev.map((e) =>
            e.id === dto.id ? { ...e, ...dto, updatedAt: new Date() } : e
          )
        );
        modals.modalEditCoursePeriod.close();
        setCoursePeriodSelected(null);
      },
    });
  };

  const handleDeleteCoursePeriod = async (_coursePeriodId: string) => {
    await executeAsync({
      action: () => deleteCoursePeriod(token, _coursePeriodId),
      loadingMessage: "Excluindo período letivo...",
      successMessage: "Período letivo excluído com sucesso!",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => {
        setEntities((prev) => prev.filter((e) => e.id !== _coursePeriodId));
      },
    });
  };

  const handleAddClass = (coursePeriodId: string) => {
    const coursePeriod = entities.find((e) => e.id === coursePeriodId);
    if (coursePeriod) {
      setCoursePeriodSelected(coursePeriod);
      modals.modalCreateClass.open();
    }
  };

  const handleEditClass = (classId: string) => {
    const coursePeriodItem = entities.find((e) =>
      e.classes.find((c) => c.id === classId)
    );
    const classItem = coursePeriodItem?.classes.find((c) => c.id === classId);
    if (coursePeriodItem && classItem) {
      setCoursePeriodSelected(coursePeriodItem);
      setClassSelected(classItem);
      modals.modalCreateClass.open();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const ModalCreateCoursePeriod = () => {
    if (modals.modalCreateCoursePeriod.isOpen) {
      return (
        <CoursePeriodCreateEditModal
          isOpen={modals.modalCreateCoursePeriod.isOpen}
          handleClose={() => modals.modalCreateCoursePeriod.close()}
          onCreate={handleSuccessCreateCoursePeriod}
          onEdit={() => {}} // Não usado no modo criação
        />
      );
    }
    return null;
  };

  const ModalEditCoursePeriod = () => {
    if (modals.modalEditCoursePeriod.isOpen && coursePeriodSelected) {
      return (
        <CoursePeriodCreateEditModal
          isOpen={modals.modalEditCoursePeriod.isOpen}
          handleClose={() => {
            modals.modalEditCoursePeriod.close();
            setCoursePeriodSelected(null);
          }}
          entity={coursePeriodSelected}
          onCreate={() => {}} // Não usado no modo edição
          onEdit={handleSuccessEditCoursePeriod}
        />
      );
    }
    return null;
  };

  const handleSuccessCreateClass = (classItem: ClassEntity) => {
    const entitiesUpdated = entities.map((e) =>
      e.id === coursePeriodSelected!.id
        ? { ...e, classes: [...e.classes, classItem] }
        : e
    );
    setEntities(entitiesUpdated);
  };

  const handleSuccessEditClass = (classItem: ClassEntity) => {
    const entitiesUpdated = entities.map((e) =>
      e.id === coursePeriodSelected!.id
        ? {
            ...e,
            classes: e.classes.map((c) =>
              c.id === classItem.id ? classItem : c
            ),
          }
        : e
    );
    setEntities(entitiesUpdated);
  };

  const ModalCreateClass = () => {
    if (modals.modalCreateClass.isOpen) {
      return (
        <ClassCreateEditModal
          isOpen={modals.modalCreateClass.isOpen}
          handleClose={() => modals.modalCreateClass.close()}
          entity={classSelected}
          coursePeriodSelected={coursePeriodSelected!.id}
          onCreateClass={handleSuccessCreateClass}
          onEditClass={handleSuccessEditClass}
        />
      );
    }
    return null;
  };

  const totalPages = Math.ceil(totalItems / limit);

  if (loading) {
    return (
      <>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h4" fontWeight="bold" className="text-marine">
              Períodos Letivos
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
            Períodos Letivos
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
              Períodos Letivos
            </Typography>
          </Toolbar>
        </AppBar>
        <div className="flex justify-end items-center w-full">
          <Box p={0}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateCoursePeriod}
            >
              Criar Período Letivo
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
            Períodos Letivos
          </Typography>
          <EmptyState />
        </Box>
        <ModalCreateCoursePeriod />
        <ModalEditCoursePeriod />
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h4" fontWeight="bold" className="text-marine">
            Períodos Letivos
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateCoursePeriod}
            sx={{ ml: 2 }}
          >
            Novo Período Letivo
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
            Períodos Letivos ({entities.length})
          </Typography>
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
                    return (
                      <ExpandableCoursePeriod
                        key={entity.id}
                        coursePeriod={entity}
                        setCoursePeriod={(period) => {
                          setEntities((prev) =>
                            prev.map((e) => (e.id === period.id ? period : e))
                          );
                        }}
                        handleAddClass={handleAddClass}
                        handleEditClass={handleEditClass}
                        handleEditCoursePeriod={handleEditCoursePeriod}
                        handleDeleteCoursePeriod={handleDeleteCoursePeriod}
                      />
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>

        {/* Paginação */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) {
                        handlePageChange(currentPage - 1);
                      }
                    }}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) {
                        handlePageChange(currentPage + 1);
                      }
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </Box>
        )}
      </Box>

      <ModalCreateCoursePeriod />
      <ModalEditCoursePeriod />
      <ModalCreateClass />
    </>
  );
}
