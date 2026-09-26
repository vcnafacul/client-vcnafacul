import { SelectProps } from "@/components/atoms/select";
import {
  DashDateRangeFilter,
  DashListTemplate,
  type DashAction,
} from "@/components/dashV2";
import { FilterProps } from "@/components/atoms/filter";
import Button from "@/components/molecules/button";
import { CardDash } from "@/components/molecules/cardDash";
import { DashCardContext } from "@/context/dashCardContext";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { createInscription } from "@/services/prepCourse/inscription/createInscription";
import { deleteInscription } from "@/services/prepCourse/inscription/deleteInscription";
import { getTodasAsInscricoes } from "@/services/prepCourse/inscription/getAllInscription";
import { updateInscription } from "@/services/prepCourse/inscription/updateInscription";
import { useAuthStore } from "@/store/auth";
import { Inscription } from "@/types/partnerPrepCourse/inscription";
import { formatDate } from "@/utils/date";
import { Paginate } from "@/utils/paginate";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { colunasDeProcesso, ORDENACAO_PADRAO } from "./columns";
import { dataInscription } from "./data";
import {
  contarFiltrosAtivos,
  filtrarProcessos,
  SEM_FILTROS,
  type FiltrosDoProcesso,
} from "./filtros";
import { statusDoProcesso } from "./status";
import {
  InscriptionInfoCreateEditModal,
  InscriptionOutput,
} from "./modals/InscriptionInfoCreateEditModal";
import { InscriptionInfoModal } from "./modals/InscriptionInfoModal";

/** Card 04 da série `tickets/021-dash-v2-processo-seletivo`. */
export const TEXTO_SEM_PROCESSOS = "Nenhum processo seletivo cadastrado";

export function PartnerPrepInscriptionManager() {
  /*
    ⚠️ Três estados, e não o `processing` de antes: o erro de busca deixava o
    spinner girando para sempre (card 02 trocou por toast; aqui vira o estado
    de erro do template, com "tentar de novo").
  */
  const [estado, setEstado] = useState<"idle" | "loading" | "error">("loading");
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [inscriptionSelected, setInscriptionSelected] = useState<
    Inscription | undefined
  >(undefined);
  const [pendingCreation, setPendingCreation] =
    useState<InscriptionOutput | null>(null);
  const [testConfirmed, setTestConfirmed] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosDoProcesso>(SEM_FILTROS);
  const filtrar = (parcial: Partial<FiltrosDoProcesso>) =>
    setFiltros((atual) => ({ ...atual, ...parcial }));

  const modals = useModals(["modalCreate", "modalInfo", "modalConfirmTest"]);

  const {
    data: { token },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  /*
    ⚠️ O Provider ainda exige `getMoreCards` e `cardTransformation`. O V2 não
    pagina pelo servidor (a lista inteira vem do card 02) e usa as colunas
    explícitas — o `cardTransformation` segue só porque o template tira dele o
    `id` do clique, e porque é o que a tela usaria se voltasse ao V1.
  */
  const getMoreCards = async (): Promise<Paginate<Inscription>> => ({
    data: [],
    page: 0,
    limit: 0,
    totalItems: 0,
  });

  const cardTransformation = (inscription: Inscription): CardDash => ({
    id: inscription.id,
    title: inscription.name,
    status: statusDoProcesso(inscription),
    infos: [
      {
        field: "Inicia",
        value: inscription.startDate
          ? formatDate(inscription.startDate.toString())
          : "",
      },
      {
        field: "Encerra",
        value: inscription.endDate
          ? formatDate(inscription.endDate.toString())
          : "",
      },
      {
        field: "Inscritos",
        value: inscription.subscribersCount.toString(),
      },
      {
        field: "Criado em",
        value: inscription.createdAt
          ? formatDate(inscription.createdAt.toString())
          : "",
      },
    ],
  });

  const onClickCard = (cardId: number | string) => {
    setInscriptionSelected(inscriptions.find((ins) => ins.id === cardId)!);
    modals.modalInfo.open();
  };
  /*
    ⚠️ Filtra no client, sobre a lista INTEIRA (card 02) — decisão da série:
    um cursinho tem poucos processos, e o V2 não pagina pelo servidor.
  */
  const filteredInscriptions = useMemo(
    () => filtrarProcessos(inscriptions, filtros),
    [inscriptions, filtros],
  );

  const filterProps: FilterProps = {
    placeholder: "Buscar por nome",
    filtrar: (e: React.ChangeEvent<HTMLInputElement>) =>
      filtrar({ nome: e.target.value }),
    defaultValue: filtros.nome,
  };

  const selectFiltes: SelectProps[] = [
    {
      "aria-label": "Status",
      options: dataInscription.statusOptions,
      setState: (value) => filtrar({ status: Number(value) as StatusEnum }),
      // Controlado: o template lê o valor daqui a cada render
      defaultValue: filtros.status,
    },
  ];

  /*
    ⚠️ A contagem também é o que faz o template voltar à página 1 quando um
    filtro de data muda — ele não renderiza os campos de data, só os recebe em
    `filters`, e observa esta contagem.
  */
  const activeFilterCount = contarFiltrosAtivos(filtros);
  const clearFilters = () => setFiltros(SEM_FILTROS);

  const filtrosDeData = (
    <>
      <DashDateRangeFilter
        label="Inicia em"
        value={filtros.iniciaEm}
        onChange={(iniciaEm) => filtrar({ iniciaEm })}
      />
      <DashDateRangeFilter
        label="Criado em"
        value={filtros.criadoEm}
        onChange={(criadoEm) => filtrar({ criadoEm })}
      />
    </>
  );

  /*
    ⚠️ Sem permissão própria, como antes (a linha `disabled:
    !permissao[Roles.criarQuestao]` estava comentada): a tela inteira já está
    atrás de `gerenciarProcessoSeletivo`. Mudar permissão junto com o
    redesenho esconderia a mudança na revisão.
  */
  const acaoPrimaria: DashAction = {
    id: "novo-processo",
    label: "Novo processo seletivo",
    onClick: () => modals.modalCreate.open(),
  };

  const handleCreate = async (data: InscriptionOutput) => {
    if (data.isTest) {
      setPendingCreation(data);
      setTestConfirmed(false);
      modals.modalConfirmTest.open();
      return;
    }
    await executeAsync({
      action: () => createInscription(token, data),
      loadingMessage: "Criando Processo Seletivo...",
      successMessage: "Processo Seletivo criado com sucesso!",
      errorMessage: "Erro ao criar processo seletivo",
      onSuccess: () => {
        modals.modalCreate.close();
        fetchInscriptions();
      },
    });
  };

  const confirmTestCreation = async () => {
    if (!pendingCreation) return;

    await executeAsync({
      action: () => createInscription(token, pendingCreation),
      loadingMessage: "Criando Processo de Teste...",
      successMessage: "Processo de teste criado com sucesso!",
      errorMessage: "Erro ao criar processo de teste",
      onSuccess: () => {
        modals.modalConfirmTest.close();
        modals.modalCreate.close();
        setPendingCreation(null);
        fetchInscriptions();
      },
    });
  };

  const cancelTestCreation = () => {
    setPendingCreation(null);
    setTestConfirmed(false);
    modals.modalConfirmTest.close();
  };

  const ModalCreate = () => {
    return modals.modalCreate.isOpen ? (
      <InscriptionInfoCreateEditModal
        isOpen={modals.modalCreate.isOpen}
        handleClose={() => modals.modalCreate.close()}
        onCreateEdit={handleCreate}
      />
    ) : null;
  };

  const handleEdit = async (data: InscriptionOutput) => {
    await executeAsync({
      action: () => updateInscription(token, data),
      loadingMessage: "Atualizando Processo Seletivo...",
      successMessage: "Processo Seletivo atualizado com sucesso!",
      errorMessage: "Erro ao atualizar processo seletivo",
      onSuccess: () => {
        setInscriptionSelected({
          ...inscriptionSelected!,
          name: data.name,
          openingsCount: data.openingsCount,
          description: data.description,
          startDate: data.range[0],
          endDate: data.range[1],
          requestDocuments: data.requestDocuments,
          isTest: data.isTest,
        });
        fetchInscriptions();
      },
    });
  };

  const handleDelete = async () => {
    deleteInscription(token, inscriptionSelected!.id)
      .then(() => {
        setInscriptions(
          inscriptions.filter((ins) => ins.id !== inscriptionSelected?.id),
        );
        modals.modalInfo.close();
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const ModalInfo = () => {
    return modals.modalInfo.isOpen ? (
      <InscriptionInfoModal
        isOpen={modals.modalInfo.isOpen}
        handleClose={() => {
          modals.modalInfo.close();
        }}
        inscription={inscriptionSelected}
        setInscription={(insc) => {
          // Atualizar a lista de inscrições
          setInscriptions(
            inscriptions.map((ins) => (ins.id === insc.id ? insc : ins)),
          );
          // Atualizar também a inscrição selecionada para refletir no modal
          setInscriptionSelected(insc);
        }}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
    ) : null;
  };

  const ModalConfirmTest = () => {
    return modals.modalConfirmTest.isOpen ? (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white p-6 rounded-xl w-[400px]">
          <h2 className="text-2xl font-bold mb-4 text-yellow-600">
            Atenção
          </h2>

          <p className="mb-6 text-sm leading-relaxed">
            Você está criando um <strong>Processo Seletivo de Teste</strong>.
            Leia com atenção antes de confirmar:
          </p>
          <ul className="mb-6 text-sm leading-relaxed list-disc list-inside space-y-2">
            <li>
              Uma vez criado como teste, <strong>não é possível alterar para um Processo Seletivo normal</strong>.
            </li>
            <li>
              <strong>Nenhum estudante</strong> inscrito neste processo poderá ser matriculado.
            </li>
          </ul>
          <label className="flex items-center gap-3 mb-6 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={testConfirmed}
              onChange={(e) => setTestConfirmed(e.target.checked)}
              className="w-4 h-4 accent-orange-500 cursor-pointer"
            />
            <span className="text-sm font-medium">
              Entendi e quero continuar
            </span>
          </label>
          <div className="flex justify-end gap-4 sm:col-span-2 mt-2">
            <Button
              typeStyle="secondary"
              className="w-24 h-9"
              onClick={cancelTestCreation}
            >
              Cancelar
            </Button>
            <Button
              typeStyle="primary"
              className="w-24 h-9"
              onClick={confirmTestCreation}
              disabled={!testConfirmed}
            >
              Salvar
            </Button>
          </div>
        </div>
      </div>
    ) : null;
  };

  /*
    ⚠️ Só a PRIMEIRA carga (ou o "tentar de novo") mostra o skeleton. Depois de
    criar ou editar, a lista é recarregada por baixo — trocar a tabela por
    skeleton a cada salvamento faria a tela piscar e perder a rolagem.
    A ordenação é do template (`ORDENACAO_PADRAO`), não daqui.
  */
  const fetchInscriptions = useCallback(
    async (mostrarCarregando = false) => {
      if (mostrarCarregando) setEstado("loading");
      try {
        setInscriptions(await getTodasAsInscricoes(token));
        setEstado("idle");
      } catch (e) {
        console.error("Erro ao buscar inscrições", e);
        setEstado("error");
      }
    },
    [token],
  );

  useEffect(() => {
    fetchInscriptions(true);
  }, [fetchInscriptions]);

  return (
    <DashCardContext.Provider
      value={{
        title: dataInscription.title,
        entities: filteredInscriptions,
        /*
          ⚠️ O setter REAL. O template do V2 nunca o chama; o setter que só
          acrescentava ids novos era contorno do scroll do V1 e saiu. Uma
          função vazia aqui esconderia o bug do par "lista filtrada + setter da
          bruta" no dia em que a tela voltasse ao V1.
        */
        setEntities: setInscriptions,
        onClickCard,
        getMoreCards,
        limitCards: 10,
        cardTransformation,
        filterProps,
        selectFiltes,
        totalItems: filteredInscriptions.length,
      }}
    >
      <DashListTemplate<Inscription>
        columns={colunasDeProcesso}
        actions={{ primary: acaoPrimaria }}
        filters={filtrosDeData}
        activeFilterCount={activeFilterCount}
        totalSemFiltro={inscriptions.length}
        onClearFilters={clearFilters}
        defaultSort={ORDENACAO_PADRAO}
        state={estado}
        onRetry={() => fetchInscriptions(true)}
        textoVazio={TEXTO_SEM_PROCESSOS}
      />
      <ModalInfo />
      <ModalCreate />
      <ModalConfirmTest />
    </DashCardContext.Provider>
  );
}
