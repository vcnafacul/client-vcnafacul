import { Skeleton } from "@/components/ui/skeleton";
import { Question } from "@/dtos/question/questionDTO";
import { Roles } from "@/enums/roles/roles";
import { useToastAsync } from "@/hooks/useToastAsync";
import { getQuestionById } from "@/services/question/getQuestionById";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";
import ModalTabTemplateQuestion from "../components/ModalTabTemplateQuestion";
import { TabClassificacao } from "./tabs/TabClassificacao";
import { TabConteudo } from "./tabs/TabConteudo";
import { TabHistorico } from "./tabs/TabHistorico";
import { TabImagens } from "./tabs/TabImagens";

interface ModalQuestionDetailsRefactoredProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string | null;
  infos: any;
}

export function ModalQuestionDetailsRefactored({
  isOpen,
  onClose,
  questionId,
  infos,
}: ModalQuestionDetailsRefactoredProps) {
  const {
    data: { token, permissao },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar permissões
  const canEdit =
    permissao[Roles.validarQuestao] || permissao[Roles.criarQuestao];

  useEffect(() => {
    if (!isOpen || !questionId) {
      setQuestion(null);
      setError(null);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      // Buscar questão e informações dos dropdowns em paralelo
      await executeAsync({
        action: () => getQuestionById(token, questionId),
        loadingMessage: "Carregando questão...",
        errorMessage: "Erro ao carregar questão",
        onError: (err) => {
          setError(err.message || "Erro ao carregar questão");
        },
        onSuccess: (questionData) => {
          setQuestion(questionData);
        },
        onFinally: () => {
          setIsLoading(false);
        },
      });
    };

    fetchData();
  }, [isOpen, questionId, token]);

  if (!questionId) return null;

  // Estado de loading
  if (isLoading) {
    return (
      <ModalTabTemplateQuestion
        isOpen={isOpen}
        className="p-6"
        tabs={[
          {
            label: "Carregando...",
            id: "loading",
            children: (
              <div className="space-y-6 p-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ),
            handleClose: onClose,
          },
        ]}
      />
    );
  }

  // Estado de erro
  if (error || !question) {
    return (
      <ModalTabTemplateQuestion
        isOpen={isOpen}
        className="p-6"
        tabs={[
          {
            label: "Erro",
            id: "error",
            children: (
              <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Erro ao carregar questão
                </h3>
                <p className="text-gray-600 mb-6">
                  {error || "Não foi possível carregar os dados da questão"}
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
                >
                  Fechar
                </button>
              </div>
            ),
            handleClose: onClose,
          },
        ]}
      />
    );
  }

  return (
    <ModalTabTemplateQuestion
      isOpen={isOpen}
      className="px-4 py-2"
      tabs={[
        {
          label: "Classificação",
          id: "classificacao",
          children: (
            <TabClassificacao
              question={question}
              canEdit={canEdit}
              infos={infos}
            />
          ),
          handleClose: onClose,
        },
        {
          label: "Conteúdo",
          id: "conteudo",
          children: <TabConteudo question={question} canEdit={canEdit} />,
          handleClose: onClose,
        },
        {
          label: "Imagens",
          id: "imagens",
          children: <TabImagens question={question} canEdit={canEdit} />,
          handleClose: onClose,
        },
        {
          label: "Histórico",
          id: "historico",
          children: <TabHistorico questionId={question._id} />,
          handleClose: onClose,
        },
      ]}
    />
  );
}
