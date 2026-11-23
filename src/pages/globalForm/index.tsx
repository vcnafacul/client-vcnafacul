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
import { Alert } from "@/components/ui/alert";
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "@/lib/toast";
import { useAcimaDeSm } from "@/components/dashV2/useAcimaDeSm";
import { ExpandableSection } from "../partnerPrepForm/components/expandableSection";
import { SecoesMobile } from "../partnerPrepForm/components/SecoesMobile";
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
  // Abaixo de 768px (o `sm` do projeto) a tabela vira cards.
  const acimaDeSm = useAcimaDeSm();
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
    <div className="flex flex-col gap-4 p-4" aria-busy="true">
      {[...Array(3)].map((_, index) => (
        <Skeleton key={index} className="h-[60px] w-full rounded-lg" />
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-h4 text-muted-foreground">Nenhuma seção encontrada</p>
      <p className="text-body text-muted-foreground">
        Comece criando a primeira seção do formulário global
      </p>
    </div>
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
    <header className="flex flex-wrap items-center justify-between gap-2 py-2">
      <h1 className="text-h1 text-foreground">Formulário Global</h1>
      {!loading && entities.length > 0 && (
        <Button
          variant="cta"
          onClick={handleCreateSection}
          className={!acimaDeSm ? "w-full" : undefined}
        >
          Nova Seção
        </Button>
      )}
    </header>
  );

  const aviso = (
    <Alert
          variant="info"
          title="Este formulário é incluído em todos os processos seletivos."
          className="mx-2 mb-4"
        />
  );

  if (loading) {
    return (
      <>
        {PageHeader()}
        {aviso}
        <section>
          <h2 className="pl-5 text-h4 text-foreground">Seções</h2>
          {LoadingSkeleton()}
        </section>
      </>
    );
  }

  if (entities.length === 0) {
    return (
      <>
        {PageHeader()}
        {aviso}
        <div className="flex w-full justify-end px-4">
          <Button
            variant="cta"
            className={!acimaDeSm ? "w-full" : undefined}
            onClick={() => modals.modalCreateSection.open()}
          >
            Criar Seção
          </Button>
        </div>
        <section className="mt-4">
          <h2 className="pl-5 text-h4 text-foreground">Seções</h2>
          {EmptyState()}
        </section>
        {CreateSection()}
      </>
    );
  }

  return (
    <>
      {PageHeader()}
      {aviso}

      <section>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 px-2">
          <h2 className="text-h4 text-foreground">
            Seções ({entities.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            <p className="text-body text-muted-foreground">
              Total de questões:{" "}
              {entities.reduce(
                (acc, section) => acc + section.questions.length,
                0
              )}
            </p>
            <p className="text-body text-success">
              • Ativas:{" "}
              {entities.reduce((acc, section) => {
                if (section.active) {
                  return acc + section.questions.filter((q) => q.active).length;
                }
                return acc;
              }, 0)}
            </p>
          </div>
        </div>

        {/* Abaixo de 768px, cards (mesmos do Formulário do cursinho, #811). */}
        {!acimaDeSm ? (
          <SecoesMobile
            secoes={entities}
            allQuestions={allQuestions}
            setSection={handleSetSection}
            handleAddQuestion={handleAddQuestion}
            handleEditSection={(id) => {
              const secao = entities.find((e) => e._id === id);
              if (!secao) return;
              setSectionSelected(secao);
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
          </Card>
        )}
      </section>
      {CreateQuestion()}
      {CreateSection()}
      {UpdateSection()}
      {DuplicateSection()}
    </>
  );
}
