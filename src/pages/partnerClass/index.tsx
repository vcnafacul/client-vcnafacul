import { PageHeader, PageShell } from "@/components/ui/page-header";
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
import { Roles } from "@/enums/roles/roles";
import { useAuthStore } from "@/store/auth";
import { ClassEntity } from "@/types/partnerPrepCourse/classEntity";
import { Paginate } from "@/utils/paginate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState, type ReactNode } from "react";
import { useAcimaDeSm } from "@/components/dashV2/useAcimaDeSm";
import { ExpandableCoursePeriod } from "./components/expandableCoursePeriod";
import { BotaoAlertaEvasao } from "./alertaEvasao/botaoAlertaEvasao";
import { PeriodosMobile } from "./components/PeriodosMobile";
import { ClassCreateEditModal } from "./modals/classCreateEditModal";
import { CoursePeriodCreateEditModal } from "./modals/coursePeriodCreateEditModal";
import { useModals } from "@/hooks/useModal";

// Um único h1 por tela; o cabeçalho é o mesmo nos três estados.
function Cabecalho({ children, total }: { children?: ReactNode; total?: number }) {
  return (
    <PageHeader
      title="Períodos Letivos"
      subtitle={
        total === undefined
          ? undefined
          : `${total} ${total === 1 ? "período letivo" : "períodos letivos"}`
      }
      actions={children}
    />
  );
}

export function PartnerClass() {
  const [entities, setEntities] = useState<CoursePeriodEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [limit] = useState<number>(10);
  // Abaixo de 768px (o `sm` do projeto) a tabela vira cards.
  const acimaDeSm = useAcimaDeSm();
  const [classSelected, setClassSelected] = useState<ClassEntity | undefined>(
    undefined
  );

  const {
    data: { token, permissao },
  } = useAuthStore();
  // Criar, editar e excluir exigem gerenciarTurmas (a api também barra);
  // quem só visualiza não vê os botões — antes via e levava 403.
  const podeGerenciar = !!permissao[Roles.gerenciarTurmas];

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

  useEffect(() => {
    setLoading(true);
    executeAsync({
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
  }, [currentPage, limit, token]);

  // Componente de loading skeleton
  const LoadingSkeleton = () => (
    <div className="flex flex-col gap-4 p-4" aria-busy="true">
      {[...Array(3)].map((_, index) => (
        <Skeleton key={index} className="h-[60px] w-full rounded-lg" />
      ))}
    </div>
  );

  // Componente de estado vazio
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-h4 text-muted-foreground">
        Nenhum período letivo encontrado
      </p>
      <p className="text-body text-muted-foreground">
        Comece criando seu primeiro período letivo
      </p>
    </div>
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
      <PageShell>
        <Cabecalho />
        <section aria-label="Períodos Letivos">{LoadingSkeleton()}</section>
      </PageShell>
    );
  }

  if (entities.length === 0) {
    return (
      <PageShell>
        <Cabecalho total={0}>
          {podeGerenciar && (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <BotaoAlertaEvasao fullWidth={!acimaDeSm} />
              <Button
                variant="cta"
                onClick={handleCreateCoursePeriod}
                className={!acimaDeSm ? "w-full" : undefined}
              >
                Criar Período Letivo
              </Button>
            </div>
          )}
        </Cabecalho>
        <Card>{EmptyState()}</Card>
        {ModalCreateCoursePeriod()}
        {ModalEditCoursePeriod()}
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Cabecalho total={totalItems}>
        {podeGerenciar && (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <BotaoAlertaEvasao fullWidth={!acimaDeSm} />
            <Button
              variant="cta"
              onClick={handleCreateCoursePeriod}
              className={!acimaDeSm ? "w-full" : undefined}
            >
              Novo Período Letivo
            </Button>
          </div>
        )}
      </Cabecalho>

      <section aria-label="Períodos Letivos">
        {!acimaDeSm ? (
          <PeriodosMobile
            periodos={entities}
            setCoursePeriod={(period) => {
              setEntities((prev) =>
                prev.map((e) => (e.id === period.id ? period : e))
              );
            }}
            handleAddClass={handleAddClass}
            handleEditClass={handleEditClass}
            handleEditCoursePeriod={handleEditCoursePeriod}
            handleDeleteCoursePeriod={handleDeleteCoursePeriod}
            podeGerenciar={podeGerenciar}
          />
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="w-5">
                    <span className="sr-only">Expandir</span>
                  </TableHead>
                  {columns.map((column) => (
                    <TableHead
                      key={column.key as string}
                      className={`font-bold text-primary ${
                        column.align === "right"
                          ? "text-right"
                          : column.align === "center"
                            ? "text-center"
                            : ""
                      }`.trim()}
                    >
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
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
                      podeGerenciar={podeGerenciar}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
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

                {/* No celular a lista de todas as páginas não cabe. */}
                {!acimaDeSm && (
                  <PaginationItem>
                    <span className="px-3 text-body text-muted-foreground">
                      {currentPage} de {totalPages}
                    </span>
                  </PaginationItem>
                )}
                {acimaDeSm && Array.from({ length: totalPages }, (_, i) => i + 1).map(
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
          </div>
        )}
      </section>

      {ModalCreateCoursePeriod()}
      {ModalEditCoursePeriod()}
      {ModalCreateClass()}
    </PageShell>
  );
}
