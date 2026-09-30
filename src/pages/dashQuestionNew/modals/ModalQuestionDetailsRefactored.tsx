import { Skeleton } from "@/components/ui/skeleton";
import { podeEditarQuestao } from "../permissoesDoBanco";
import { Question } from "@/dtos/question/questionDTO";
import { useToastAsync } from "@/hooks/useToastAsync";
import { toast } from "react-toastify";
import { getQuestionById } from "@/services/question/getQuestionById";

import { useAuthStore } from "@/store/auth";
import { useCallback, useEffect, useRef, useState } from "react";
import { PendingImageStore } from "@/utils/pendingImageStore";
import ModalTabTemplateQuestion from "../components/ModalTabTemplateQuestion";
import { AcoesDaQuestao } from "../components/AcoesDaQuestao";
import { AbaLinhagem } from "../components/AbaLinhagem";
import { NavegacaoDaLista } from "../components/NavegacaoDaLista";
import { TrilhaDaLinhagem } from "../components/TrilhaDaLinhagem";
import ModalConfirmCancel from "@/components/organisms/modalConfirmCancel";
import { TabClassificacao } from "./tabs/TabClassificacao";
import { TabConteudo } from "./tabs/TabConteudo";
import { TabAlternativas } from "./tabs/TabAlternativas";
import { TabHistorico } from "./tabs/TabHistorico";
import { TabImagens } from "./tabs/TabImagens";
import { useConteudoForm } from "./tabs/TabConteudo/useConteudoForm";
import { ModalEscolhaAoSalvar } from "./tabs/TabConteudo/ModalEscolhaAoSalvar";

interface ModalQuestionDetailsRefactoredProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string | null;
  infos: any;
  /**
   * Abre outra questão no mesmo modal (card 25).
   *
   * ⚠️ **Opcional**: quem monta o modal decide se sabe trocar de questão. Sem
   * ele, o badge e a lista de cópias aparecem sem link — a informação continua
   * visível, que é o mínimo.
   */
  abrirQuestao?: (id: string) => void;
  /** Chamado depois de excluir a questão (card 33). */
  aoExcluir?: () => void;
  /** Por onde a pessoa veio navegando a linhagem (card 34A). */
  trilha?: string[];
  /** Volta um passo na trilha. */
  voltar?: () => void;
  /** A aba que abre selecionada — "linhagem" quando se navega por ela. */
  abaInicial?: string;
  /** Anterior/Próxima entre as questões filtradas da listagem. */
  lista?: NavegacaoNaLista;
}

export interface NavegacaoNaLista {
  anterior?: () => void;
  proxima?: () => void;
  posicao?: number | null;
  total?: number;
}

export function ModalQuestionDetailsRefactored({
  isOpen,
  onClose,
  questionId,
  infos,
  abrirQuestao,
  aoExcluir,
  trilha,
  voltar,
  abaInicial,
  lista,
}: ModalQuestionDetailsRefactoredProps) {
  const {
    data: { token, permissao },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar permissões
  // tickets/023, card 08: o editor do cursinho também edita.
  const canEdit = podeEditarQuestao(permissao);

  const fetchQuestion = async (id: string) => {
    setIsLoading(true);
    setError(null);

    await executeAsync({
      action: () => getQuestionById(token, id),
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

  /*
    ⚠️ **Recarrega SEM o esqueleto.** Com o `fetchQuestion`, o `isLoading`
    trocava o modal inteiro pelo "Carregando..." e ele remontava do zero — na
    primeira aba, sem o que a pessoa via: parecia que salvar fechava o modal.
    Aqui a questão nova só substitui a antiga quando chega; se falhar, a antiga
    fica (e o toast avisa).
  */
  const refreshQuestion = () => {
    if (!questionId) return;
    // Sem toast de "carregando": o de sucesso do save já está na tela.
    getQuestionById(token, questionId)
      .then(setQuestion)
      .catch(() => toast.error("Erro ao recarregar questão"));
  };

  useEffect(() => {
    if (!isOpen || !questionId) {
      setQuestion(null);
      setError(null);
      return;
    }

    fetchQuestion(questionId);
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
    <ModalContent
      isOpen={isOpen}
      onClose={onClose}
      question={question}
      canEdit={canEdit}
      infos={infos}
      token={token}
      refreshQuestion={refreshQuestion}
      abrirQuestao={abrirQuestao}
      aoExcluir={aoExcluir}
      trilha={trilha}
      voltar={voltar}
      abaInicial={abaInicial}
      lista={lista}
    />
  );
}

/**
 * Inner component that renders when question is loaded.
 * Hooks (useConteudoForm) can only be called unconditionally,
 * so this component is only mounted when question exists.
 */
function ModalContent({
  isOpen,
  onClose,
  question,
  canEdit,
  infos,
  token,
  refreshQuestion,
  abrirQuestao,
  aoExcluir,
  trilha = [],
  voltar,
  abaInicial,
  lista,
}: {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  canEdit: boolean;
  infos: any;
  token: string;
  refreshQuestion: () => void;
  /** Abre outra questão no mesmo modal — "ver original" e "ver cópias". */
  abrirQuestao?: (id: string) => void;
  aoExcluir?: () => void;
  trilha?: string[];
  voltar?: () => void;
  abaInicial?: string;
  lista?: NavegacaoNaLista;
}) {
  const pendingStoreRef = useRef(new PendingImageStore());
  const conteudoForm = useConteudoForm({ question, pendingStore: pendingStoreRef.current });

  /*
    ⚠️ **Trocar de questão com edição pendente pergunta antes** (card 34A).
    Navegar pela linhagem desmonta este modal e remonta com a outra questão — o
    enunciado que a pessoa estava editando se perderia calado.

    Cobre o **conteúdo** (enunciado e alternativas), que mora aqui, e a
    **Classificação**, que avisa por `onSujoChange`. Fechar no X passa pelo
    mesmo caminho — antes fechava calado e a edição se perdia.
  */
  const [classificacaoSuja, setClassificacaoSuja] = useState(false);
  const [navegacaoPendente, setNavegacaoPendente] = useState<
    (() => void) | null
  >(null);
  const navegar = (acao: () => void) => {
    if ((conteudoForm.isEditing && conteudoForm.isDirty) || classificacaoSuja) {
      setNavegacaoPendente(() => acao);
    } else {
      acao();
    }
  };
  const fechar = () => navegar(onClose);
  const abrirNaLinhagem = abrirQuestao
    ? (id: string) => navegar(() => abrirQuestao(id))
    : undefined;

  const handleImageUpload = useCallback(
    async (file: File) => {
      return pendingStoreRef.current.add(file);
    },
    []
  );

  const contentFormat = question.contentFormat || "plain";

  return (
    <>
    <ModalTabTemplateQuestion
      isOpen={isOpen}
      className="px-2 py-2 sm:px-4"
      abaInicial={abaInicial}
      cabecalho={
        abrirNaLinhagem || lista ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            {abrirNaLinhagem && voltar ? (
              <TrilhaDaLinhagem
                trilha={trilha}
                abrir={abrirNaLinhagem}
                voltar={() => navegar(voltar)}
              />
            ) : (
              <span />
            )}
            {/*
              ⚠️ Pelo mesmo `navegar`: com o enunciado em edição e sujo,
              pergunta antes de trocar de questão.
            */}
            {lista && (
              <NavegacaoDaLista
                anterior={lista.anterior && (() => navegar(lista.anterior!))}
                proxima={lista.proxima && (() => navegar(lista.proxima!))}
                posicao={lista.posicao}
                total={lista.total}
              />
            )}
          </div>
        ) : undefined
      }
      tabs={[
        {
          label: "Classificação",
          id: "classificacao",
          // Montada sempre: trocar de aba desmontava e perdia a edição.
          manterMontada: true,
          children: (
            <div className="flex flex-col gap-3">
              <TabClassificacao
                question={question}
                canEdit={canEdit}
                infos={infos}
                onSaveSuccess={refreshQuestion}
                onSujoChange={setClassificacaoSuja}
              />
              {/*
                ⚠️ **No RODAPÉ da aba, à direita** — ajuste pedido na revisão
                do card 25. Ficou aqui só o excluir: a linhagem foi para a
                aba própria (card 34A), e o duplicar para o topo dela (QA).
              */}
              <AcoesDaQuestao questaoId={question._id} aoExcluir={aoExcluir} />
            </div>
          ),
          handleClose: fechar,
        },
        {
          label: "Enunciado",
          id: "conteudo",
          children: (
            <TabConteudo
              form={conteudoForm.form}
              isEditing={conteudoForm.isEditing}
              isSaving={conteudoForm.isSaving}
              isDirty={conteudoForm.isDirty}
              isValid={conteudoForm.isValid}
              canEdit={canEdit}
              contentFormat={contentFormat}
              onEdit={conteudoForm.handleEdit}
              onSave={conteudoForm.handleSave}
              onCancel={conteudoForm.handleCancel}
              onImageUpload={handleImageUpload}
              pendingStore={pendingStoreRef.current}
              token={token}
            />
          ),
          handleClose: fechar,
        },
        {
          label: "Alternativas",
          id: "alternativas",
          children: (
            <TabAlternativas
              form={conteudoForm.form}
              isEditing={conteudoForm.isEditing}
              contentFormat={contentFormat}
              onImageUpload={handleImageUpload}
              pendingStore={pendingStoreRef.current}
              token={token}
            />
          ),
          handleClose: fechar,
        },
        {
          label: "Imagens",
          id: "imagens",
          children: (
            <TabImagens question={question} canEdit={canEdit} />
          ),
          handleClose: fechar,
        },
        /*
          ⚠️ **Aba própria, e sempre visível** (card 34A) — reverte a decisão
          do card 25 de pôr a linhagem no rodapé da Classificação: com a cadeia
          inteira e o que identifica cada item, deixou de ser três linhas.
        */
        {
          label: "Linhagem",
          id: "linhagem",
          children: (
            <AbaLinhagem
              questaoId={question._id}
              abrirQuestao={abrirNaLinhagem}
            />
          ),
          handleClose: fechar,
        },
        {
          label: "Histórico",
          id: "historico",
          children: <TabHistorico questionId={question._id} />,
          handleClose: fechar,
        },
      ]}
    />

    {/*
      ⚠️ **Fora do `ModalTabTemplateQuestion`, e não dentro de uma aba.** A
      escolha é sobre o save inteiro, não sobre o conteúdo — e um modal dentro
      de outro que troca de aba embaixo dele desaparece quando a pessoa clica
      em "Classificação" sem ter decidido.
    */}
    {navegacaoPendente && (
      <ModalConfirmCancel
        isOpen
        text="Descartar as alterações?"
        handleClose={() => setNavegacaoPendente(null)}
        handleConfirm={() => {
          const acao = navegacaoPendente;
          setNavegacaoPendente(null);
          acao();
        }}
      >
        <p className="text-sm text-gray-700">
          Você está editando esta questão. Sair agora descarta o que não foi
          salvo.
        </p>
      </ModalConfirmCancel>
    )}

    {conteudoForm.escolhaPendente && (
      <ModalEscolhaAoSalvar
        isOpen
        onClose={conteudoForm.cancelarEscolha}
        campos={conteudoForm.escolhaPendente.campos}
        respostas={question.quantidadeResposta ?? 0}
        /*
          ⚠️ As provas da questão, e não só quantas: a nova versão só entra nas
          que recebem novas versões (tickets/023, card 10). Vem do
          `provasContendo` do `getById` — quem edita não faz ideia de que uma
          questão está em 2,7 simulados em média (medido no card 22).
        */
        provas={question.provasContendo ?? []}
        // tickets/023, card 18: sem galho na linhagem.
        permiteNovaVersao={!question.teveSucessora}
        antes={question as unknown as Record<string, unknown>}
        depois={conteudoForm.escolhaPendente.dados}
        onConfirmar={conteudoForm.confirmarEscolha}
      />
    )}
    </>
  );
}
