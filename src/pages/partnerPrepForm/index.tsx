import { motivoDoErro } from "./motivoDoErro";
import { TableColumn } from "@/components/organisms/expandableTable";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { getGlobalSections } from "@/services/adminForm/getGlobalSections";
import { deleteSection } from "@/services/partnerPrepForm/deleteSection";
import { duplicateSection } from "@/services/partnerPrepForm/duplicateSection";
import { getSection } from "@/services/partnerPrepForm/getSections";
import { reorderQuestions } from "@/services/partnerPrepForm/reorderQuestions";
import { setSectionActive } from "@/services/partnerPrepForm/setSectionActive";
 import { useAuthStore } from "@/store/auth";
import { AnswerType, QuestionForm } from "@/types/partnerPrepForm/questionForm";
import { SectionForm } from "@/types/partnerPrepForm/sectionForm";
import { secoesVisiveis } from "./secoesVisiveis";
import { questoesDeReferencia } from "./questoesDeReferencia";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge as StatusBadgeUi } from "@/components/ui/status-badge";
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
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "react-toastify";
import { useAcimaDeSm } from "@/components/dashV2/useAcimaDeSm";
import { ExpandableSection } from "./components/expandableSection";
import { SecoesMobile } from "./components/SecoesMobile";
import { ModalConfirmDuplicateSection } from "./modals/modalConfirmDuplicateSection";
import { ModalCreateQuestion } from "./modals/modalCreateQuestion";
import { ModalCreateSection } from "./modals/modalCreateSection";
import { ModalUpdateSection } from "./modals/modalUpdateSection";

type AggregatedSection = {
  section: string;
  questions: number;
};

// Componente para badge de status (dentro de tabela/lista: com o ponto)
export const StatusBadge = ({ active }: { active: boolean }) => (
  <StatusBadgeUi variant={active ? "success" : "neutral"} look="dot">
    {active ? "Ativo" : "Inativo"}
  </StatusBadgeUi>
);

// Componente para badge de tipo de resposta (categoria, não estado)
export const AnswerTypeBadge = ({ answerType }: { answerType: AnswerType }) => {
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

  return <Badge variant="outline">{getLabel(answerType)}</Badge>;
};

// Componente para badge de coleção (categoria, não estado)
export const CollectionBadge = ({ collection }: { collection: string }) => (
  <Badge variant="outline">
    {collection === "single" ? "Única" : "Múltipla"}
  </Badge>
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
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Focável, para o texto completo também abrir pelo teclado. */}
          <button
            type="button"
            className="cursor-help text-left underline decoration-dotted"
          >
            {truncated}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Um único h1 por tela; o cabeçalho é o mesmo nos três estados.
function Cabecalho({ children }: { children?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-2 py-2">
      <h1 className="text-h1 text-foreground">Formulários de Preparação</h1>
      {children}
    </header>
  );
}

export default function PartnerPrepForm() {
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

  // ✅ OTIMIZAÇÃO: Memoizar allQuestions para evitar flatMap dentro do loop
  // Antes: executado N vezes (uma por cada entity)
  // Depois: executado apenas 1 vez quando entities mudar
  const allQuestions = useMemo(() => {
    return entities.flatMap((section) => section.questions);
  }, [entities]);

  // ✅ OTIMIZAÇÃO: Memoizar handler para manter referência estável
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
    try {
      const [globalRes, partnerRes] = await Promise.allSettled([
        getGlobalSections(token),
        getSection(token),
      ]);

      // Do cursinho, inclusive inativas; globais, só ativas (card 17).
      const globais =
        globalRes.status === "fulfilled" ? globalRes.value.data : [];
      const doCursinho =
        partnerRes.status === "fulfilled" ? partnerRes.value.data : [];

      if (globalRes.status === "rejected") {
        toast.warning("Não foi possível carregar seções globais");
      }
      if (partnerRes.status === "rejected") {
        toast.error("Erro ao carregar seções do parceiro");
      }

      setEntities(secoesVisiveis(globais, doCursinho));
    } catch {
      toast.error("Erro ao buscar seções");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    handleGetSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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
      <p className="text-h4 text-muted-foreground">Nenhuma seção encontrada</p>
      <p className="text-body text-muted-foreground">
        Comece criando sua primeira seção de formulário
      </p>
    </div>
  );

  const CreateQuestion = () => {
    // ✅ OTIMIZAÇÃO: Usa allQuestions memoizado em vez de calcular aqui
    return modals.modalCreateQuestion.isOpen ? (
      <ModalCreateQuestion
        isOpen={modals.modalCreateQuestion.isOpen}
        handleClose={() => modals.modalCreateQuestion.close()}
        sectionId={sectionSelected!._id}
        availableQuestions={questoesDeReferencia(
          entities,
          sectionSelected!._id
        )}
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
    const section = entities.find((e) => e._id === sectionId);
    if (!section || section.isGlobal) return;
    setSectionSelected(section);
    modals.modalCreateQuestion.open();
  };

  const handleCreateSection = () => {
    modals.modalCreateSection.open();
  };

  const handleDeleteSection = async (sectionId: string) => {
    const section = entities.find((e) => e._id === sectionId);
    if (section?.isGlobal) return;
    await executeAsync({
      action: () => deleteSection(token, sectionId),
      loadingMessage: "Excluindo seção...",
      successMessage: "Seção excluída com sucesso!",
      errorMessage: (e: unknown) => motivoDoErro(e, "Erro ao excluir seção"),
      onSuccess: () => {
        setEntities((prev) => prev.filter((e) => e._id !== sectionId));
      },
    });
  };

  const handleToggleSection = async (sectionId: string) => {
    const section = entities.find((e) => e._id === sectionId);
    if (!section || section.isGlobal) return;

    const newActiveState = !section.active;
    const action = newActiveState ? "ativando" : "desativando";
    const successMessage = newActiveState ? "ativada" : "desativada";

    await executeAsync({
      action: () => setSectionActive(token, sectionId),
      loadingMessage: `${
        action.charAt(0).toUpperCase() + action.slice(1)
      } seção...`,
      successMessage: `Seção ${successMessage} com sucesso`,
      errorMessage: (e: unknown) => motivoDoErro(e, `Erro ao ${action} seção`),
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
    const section = entities.find((e) => e._id === sectionId);
    if (section?.isGlobal) return;
    // Atualização otimista - atualiza UI primeiro
    setEntities((prev) =>
      prev.map((section) =>
        section._id === sectionId
          ? { ...section, questions: reorderedQuestions }
          : section
      )
    );

    // Chama API em background
    const questionIds = reorderedQuestions.map((q) => q._id);

    await executeAsync({
      action: () => reorderQuestions(token, sectionId, questionIds),
      loadingMessage: "Reordenando questões...",
      successMessage: "Questões reordenadas com sucesso!",
      errorMessage: (e: unknown) =>
        motivoDoErro(e, "Erro ao reordenar questões"),
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
    if (section && !section.isGlobal) {
      setSectionSelected(section);
      modals.modalConfirmDuplicate.open();
    }
  };

  const handleConfirmDuplicate = async () => {
    if (!sectionSelected) return;

    await executeAsync({
      action: () => duplicateSection(sectionSelected._id, token),
      loadingMessage: "Duplicando seção...",
      // A cópia nasce desativada de propósito (card 18): com o card 17 ela
      // aparece na tela, e o aviso diz o que fazer.
      successMessage:
        "Seção duplicada! A cópia foi criada desativada. Revise e ative.",
      errorMessage: (e: unknown) => motivoDoErro(e, "Erro ao duplicar seção"),
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
        <Cabecalho />
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
        <Cabecalho />
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
      <Cabecalho>
        <Button
          variant="cta"
          onClick={handleCreateSection}
          className={!acimaDeSm ? "w-full" : undefined}
        >
          Nova Seção
        </Button>
      </Cabecalho>

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
                    // Só seções até esta podem ser referência (card 27).
                    allQuestions={questoesDeReferencia(entities, entity._id)}
                    setSection={handleSetSection} // ✅ Usa handler memoizado
                    handleAddQuestion={handleAddQuestion}
                    handleEditSection={() => {
                      setSectionSelected(entity);
                      modals.modalUpdateSection.open();
                    }}
                    handleDeleteSection={handleDeleteSection}
                    handleToggleSection={handleToggleSection}
                    handleReorderQuestions={handleReorderQuestions}
                    handleDuplicateSection={handleOpenDuplicateModal}
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
