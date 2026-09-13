import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { FilterProps } from "../../components/atoms/filter";
import { SelectProps } from "../../components/atoms/select";
import { OptionProps } from "../../components/atoms/selectOption";
import { CardDash } from "../../components/molecules/cardDash";
import { DashListTemplate, type DashAction } from "@/components/dashV2";
import { DashCardContext } from "../../context/dashCardContext";
import { Prova } from "../../dtos/prova/prova";
import { ICategoria } from "../../dtos/categoria/categoria";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { Roles } from "../../enums/roles/roles";
import { getProvas } from "../../services/prova/getProvas";
import { getSyncReport } from "../../services/prova/getSyncReport";
import { startSync } from "../../services/prova/startSync";
import { getCategorias } from "../../services/categoria/getCategorias";
import { useAuthStore } from "../../store/auth";
import { useToastAsync } from "../../hooks/useToastAsync";
import { formatDate } from "../../utils/date";
import { Paginate } from "../../utils/paginate";
import { colunasDeProva } from "./columns";
import { dashProva } from "./data";
import NewProva from "./modals/newProva";
import ShowProva from "./modals/showProva";
import ManageCategorias from "./modals/manageCategorias";
import ManageTemplate from "./modals/manageTemplate";
import UploadCartaoModal from "./modals/uploadCartaoModal";
import { downloadSyncReportPdf } from "./utils/syncReportPdf";
import { useModals } from "@/hooks/useModal";

const EDICAO_ALL = "";
const APLICACAO_ALL = "";
const ANO_ALL = "";

/**
 * ⚠️ **`ano desc`.** O caso de uso que motivou o épico inteiro é "achar a
 * reaplicação de 2019 que ainda tem questão faltando" — e a primeira metade
 * disso é o ano. `createdAt desc` (a ordem que o servidor devolve) responde
 * "o que entrou por último", que é outra pergunta e a menos frequente aqui.
 */
const ORDENACAO_PADRAO = { columnId: "ano", direction: "desc" } as const;

const MOTIVO = {
  cadastrarProvas: "Requer permissão: cadastrar provas",
  visualizarProvas: "Requer permissão: visualizar provas",
  visualizarEstudantes: "Requer permissão: visualizar estudantes",
  alterarPermissao: "Requer permissão: alterar permissões",
} as const;

function DashProva() {
  const [provas, setProvas] = useState<Prova[]>([]);
  const [provaSelected, setProvaSelected] = useState<Prova | null>(null);

  const [categorias, setCategorias] = useState<ICategoria[]>();

  const [nameFilter, setNameFilter] = useState<string>("");
  const [edicaoFilter, setEdicaoFilter] = useState<string>(EDICAO_ALL);
  const [aplicacaoFilter, setAplicacaoFilter] = useState<string>(APLICACAO_ALL);
  const [anoFilter, setAnoFilter] = useState<string>(ANO_ALL);
  const [gabaritoOnly, setGabaritoOnly] = useState<boolean>(false);

  const limitCards = 500;

  /**
   * ⚠️ **O `DashListTemplate` não usa nada disto** — ele pagina em memória e
   * nunca chama `getMoreCards` nem `onLoadMore`. Parece código morto, e não é.
   *
   * É a rede da reversibilidade: a promessa do V2 é que esta tela volta ao V1
   * trocando a linha do import. Se o `onLoadMore` sumir daqui, voltar ao V1
   * reintroduz o defeito que o PR #679 consertou — `entities` é a lista
   * DERIVADA `filteredProvas`, e deixar o template escrever nela **apaga do
   * estado** toda prova que o filtro escondeu (não esconde: apaga; só um F5
   * traz de volta).
   *
   * Concatena na lista BRUTA `provas`, deduplicando por `_id`.
   *
   * O mecanismo em si segue coberto por `templates/dashCardTemplate/index.test.tsx`
   * e por `pages/partnerPrepProvas/index.test.tsx`, que continua no V1.
   */
  const requestedPages = useRef<Set<number>>(new Set<number>());
  const bottomReached = useRef<boolean>(false);

  const modals = useModals([
    "modalNewProva",
    "modalShowProva",
    "modalManageCategorias",
    "modalManageTemplate",
    "modalUploadCartao",
  ]);

  const {
    data: { token, permissao },
  } = useAuthStore();

  const execute = useToastAsync();

  /**
   * ⚠️ **Continua aqui, e continua obrigatório.** O `DashCardContextProps` o
   * exige, e o `DashListTemplate` o usa para extrair o `id` da linha — é ele
   * que faz `onRowClick` e `onClickCard` falarem do mesmo registro. As colunas
   * do V2 vêm de `columns.tsx` e não passam por aqui.
   *
   * ⚠️ O `status` abaixo é a derivação **errada** do V1 (uma prova em cadastro
   * vira `Rejected`, o vermelho de "recusada"). Fica intacta de propósito: o V2
   * não a lê — quem manda na coluna Status é o `status.ts` — e mexer nela aqui
   * mudaria o `CardDash` sem que nada nesta tela mostrasse a diferença.
   */
  const cardTransformation = (prova: Prova): CardDash => ({
    id: prova._id,
    title: prova.nome,
    status:
      prova.totalQuestao === prova.totalQuestaoValidadas
        ? StatusEnum.Approved
        : prova.totalQuestao === prova.totalQuestaoCadastradas
          ? StatusEnum.Pending
          : StatusEnum.Rejected,
    infos: [
      { field: "Total de Questões", value: prova.totalQuestao.toString() },
      {
        field: "Total de Questões Cadastradas",
        value: prova.totalQuestaoCadastradas.toString(),
      },
      {
        field: "Total de Questões Validadas",
        value: prova.totalQuestaoValidadas.toString(),
      },
      {
        field: "Cadastrado em ",
        value: prova.createdAt ? formatDate(prova.createdAt.toString()) : "",
      },
    ],
  });

  const onClickCard = (id: string | number) => {
    setProvaSelected(provas.find((p) => p._id === id)!);
    modals.modalShowProva.open();
  };

  const addProva = (data: Prova) => {
    const newProvas = [...provas, data];
    setProvas(newProvas);
  };

  const ModalNewProva = () => {
    return !modals.modalNewProva.isOpen ? null : (
      <NewProva
        categorias={categorias!}
        addProva={addProva}
        handleClose={() => modals.modalNewProva.close()}
        isOpen={modals.modalNewProva.isOpen}
      />
    );
  };

  const ModalManageCategorias = () => {
    return !modals.modalManageCategorias.isOpen ? null : (
      <ManageCategorias
        isOpen={modals.modalManageCategorias.isOpen}
        handleClose={() => modals.modalManageCategorias.close()}
        onCategoriasChanged={(cats) => setCategorias(cats)}
      />
    );
  };

  const ModalManageTemplate = () => {
    return !modals.modalManageTemplate.isOpen ? null : (
      <ManageTemplate
        isOpen={modals.modalManageTemplate.isOpen}
        handleClose={() => modals.modalManageTemplate.close()}
      />
    );
  };

  const ModalShowProva = () => {
    return !modals.modalShowProva.isOpen ? null : (
      <ShowProva
        prova={provaSelected!}
        handleClose={() => {
          modals.modalShowProva.close();
        }}
        isOpen={modals.modalShowProva.isOpen}
        onUpdated={(updated) => {
          setProvas((prev) =>
            prev.map((p) => (p._id === updated._id ? updated : p)),
          );
          setProvaSelected(updated);
        }}
      />
    );
  };

  useEffect(() => {
    requestedPages.current = new Set<number>([1]);
    bottomReached.current = false;

    getProvas(token, 1, limitCards)
      .then((res) => {
        setProvas(res.data);
      })
      .catch((erro: Error) => {
        toast.error(erro.message);
      });

    getCategorias(token)
      .then((res) => {
        setCategorias(res.data);
      })
      .catch((erro: Error) => {
        toast.error(erro.message);
      });
  }, [token]);

  const getMoreCards = async (page: number): Promise<Paginate<Prova>> => {
    return await getProvas(token, page, limitCards);
  };

  const loadMoreProvas = (page: number) => {
    if (page < 1) return;
    if (bottomReached.current || requestedPages.current.has(page)) return;
    requestedPages.current.add(page);

    getProvas(token, page, limitCards)
      .then((res) => {
        const newItems = res?.data ?? [];
        if (newItems.length < limitCards) bottomReached.current = true;
        if (newItems.length === 0) return;

        setProvas((prev) => {
          const knownIds = new Set(prev.map((p) => p._id));
          const genuinelyNew = newItems.filter((p) => !knownIds.has(p._id));
          return genuinelyNew.length > 0 ? [...prev, ...genuinelyNew] : prev;
        });
      })
      .catch((erro: Error) => {
        requestedPages.current.delete(page);
        toast.error(erro.message);
      });
  };

  const edicaoOptions: OptionProps[] = useMemo(() => {
    const set = new Set<string>();
    provas.forEach((p) => {
      if (p.edicao) set.add(p.edicao);
    });
    return [
      { id: EDICAO_ALL, name: "Todas edições" },
      ...Array.from(set)
        .sort((a, b) => a.localeCompare(b))
        .map((v) => ({ id: v, name: v })),
    ];
  }, [provas]);

  const aplicacaoOptions: OptionProps[] = useMemo(() => {
    const set = new Set<number>();
    provas.forEach((p) => {
      if (p.aplicacao !== undefined && p.aplicacao !== null)
        set.add(p.aplicacao);
    });
    return [
      { id: APLICACAO_ALL, name: "Todas aplicações" },
      ...Array.from(set)
        .sort((a, b) => a - b)
        .map((v) => ({ id: v.toString(), name: v.toString() })),
    ];
  }, [provas]);

  const anoOptions: OptionProps[] = useMemo(() => {
    const set = new Set<number>();
    provas.forEach((p) => {
      if (p.ano !== undefined && p.ano !== null) set.add(p.ano);
    });
    return [
      { id: ANO_ALL, name: "Todos os anos" },
      ...Array.from(set)
        .sort((a, b) => b - a)
        .map((v) => ({ id: v.toString(), name: v.toString() })),
    ];
  }, [provas]);

  const filteredProvas = useMemo(() => {
    const term = nameFilter.trim().toLowerCase();
    return provas.filter((p) => {
      if (term && !p.nome?.toLowerCase().includes(term)) return false;
      if (edicaoFilter && p.edicao !== edicaoFilter) return false;
      if (aplicacaoFilter && p.aplicacao?.toString() !== aplicacaoFilter)
        return false;
      if (anoFilter && p.ano?.toString() !== anoFilter) return false;
      if (gabaritoOnly && !p.gabarito) return false;
      return true;
    });
  }, [
    provas,
    nameFilter,
    edicaoFilter,
    aplicacaoFilter,
    anoFilter,
    gabaritoOnly,
  ]);

  const filterProps: FilterProps = {
    placeholder: "Buscar por nome",
    filtrar: (e: React.ChangeEvent<HTMLInputElement>) =>
      setNameFilter(e.target.value),
    defaultValue: nameFilter,
  };

  const selectFiltes: SelectProps[] = [
    {
      options: edicaoOptions,
      defaultValue: edicaoFilter,
      setState: (value: string) => setEdicaoFilter(value),
    },
    {
      options: aplicacaoOptions,
      defaultValue: aplicacaoFilter,
      setState: (value: string) => setAplicacaoFilter(value),
    },
    {
      options: anoOptions,
      defaultValue: anoFilter,
      setState: (value: string) => setAnoFilter(value),
    },
  ];

  /**
   * ⚠️ Contagem, não booleano: é o número que aparece em "Limpar filtros (3)"
   * e é a mudança dele que devolve a lista para a página 1 quando o filtro vem
   * de um controle que o template não enxerga (o checkbox de gabarito).
   */
  const activeFilterCount = [
    nameFilter !== "",
    edicaoFilter !== EDICAO_ALL,
    aplicacaoFilter !== APLICACAO_ALL,
    anoFilter !== ANO_ALL,
    gabaritoOnly,
  ].filter(Boolean).length;

  const handleSync = () => {
    execute({
      action: () => startSync(token),
      loadingMessage: "Sincronizando provas...",
      successMessage: "Sincronizacao iniciada com sucesso!",
      errorMessage: (err: Error) => err.message || "Erro ao sincronizar",
    });
  };

  const handleSyncReport = () => {
    execute({
      action: () => getSyncReport(token),
      loadingMessage: "Buscando relatorio...",
      successMessage: "Relatorio gerado!",
      errorMessage: (err: Error) => err.message || "Erro ao buscar relatorio",
      onSuccess: (report) => {
        if (report.status === "processing") {
          toast.info(
            "Sincronizacao ainda em andamento. Tente novamente em instantes.",
          );
          return;
        }
        if (report.status === "idle") {
          toast.info("Nenhuma sincronizacao realizada ainda.");
          return;
        }
        downloadSyncReportPdf(report);
      },
    });
  };

  /**
   * ⚠️ **Sem `setResetKey`.** O V1 remontava o `DashCardTemplate` inteiro com
   * `key={resetKey}` para limpar os filtros, porque os selects dele não eram
   * controlados. Remontar descarta a ordenação, a página e a posição de
   * rolagem — a pessoa limpa a busca e perde o "ordenado por progresso" que
   * tinha acabado de pedir. Aqui os controles são controlados e limpar filtro
   * limpa só filtro; a ordenação é do usuário e continua onde estava.
   */
  const clearFilters = () => {
    setNameFilter("");
    setEdicaoFilter(EDICAO_ALL);
    setAplicacaoFilter(APLICACAO_ALL);
    setAnoFilter(ANO_ALL);
    setGabaritoOnly(false);
  };

  function acao(
    id: string,
    label: string,
    permitido: boolean,
    motivo: string,
    onClick: () => void,
  ): DashAction {
    return {
      id,
      label,
      onClick,
      disabled: !permitido,
      // ⚠️ O V1 deixava o botão com `opacity-30` e nada explicava por quê.
      disabledReason: permitido ? undefined : motivo,
    };
  }

  /**
   * ⚠️ **Uma única ação laranja na tela, e é "Nova Prova".** Hoje o laranja
   * está em "Sincronizar" — manutenção rara que dispara processamento pesado —
   * enquanto a ação que a tela existe para permitir é o botão mais apagado dos
   * seis. E "Limpar filtros" era vermelho, sendo controle de filtro; ele saiu
   * daqui e virou link na barra de filtros, via `onClearFilters`.
   */
  const acaoPrimaria = acao(
    "nova-prova",
    "Nova Prova",
    permissao[Roles.cadastrarProvas],
    MOTIVO.cadastrarProvas,
    () => {
      setProvaSelected(null);
      modals.modalNewProva.open();
    },
  );

  const acoesSecundarias: DashAction[] = [
    acao(
      "enviar-cartao",
      "Enviar cartão",
      permissao[Roles.visualizarEstudantes],
      MOTIVO.visualizarEstudantes,
      () => modals.modalUploadCartao.open(),
    ),
    /*
      ⚠️ `Roles.alterarPermissao` para categoria de prova é permissão de
      administração de papéis e não tem relação com o que o botão faz — parece
      copiar-e-colar antigo. **Não é corrigido aqui de propósito:** mudar regra
      de permissão no mesmo commit de um redesenho esconde a mudança na
      revisão. Está registrado como ticket próprio.
    */
    acao(
      "gerenciar-categorias",
      "Gerenciar Categorias",
      permissao[Roles.alterarPermissao],
      MOTIVO.alterarPermissao,
      () => modals.modalManageCategorias.open(),
    ),
    acao(
      "template-caderno",
      "Template do caderno",
      permissao[Roles.alterarPermissao],
      MOTIVO.alterarPermissao,
      () => modals.modalManageTemplate.open(),
    ),
  ];

  /**
   * ⚠️ As duas vão para o `⋯`: "Sincronizar" é manutenção rara (confirmado com
   * quem usa a tela) e "Relatório Sync" só faz sentido depois dela. Deixá-las
   * na barra é o que fazia seis botões competirem pela atenção de quem só quer
   * cadastrar uma prova.
   */
  const acoesOverflow: DashAction[] = [
    acao(
      "sincronizar",
      "Sincronizar",
      permissao[Roles.cadastrarProvas],
      MOTIVO.cadastrarProvas,
      handleSync,
    ),
    acao(
      "relatorio-sync",
      "Relatório Sync",
      permissao[Roles.visualizarProvas],
      MOTIVO.visualizarProvas,
      handleSyncReport,
    ),
  ];

  const GabaritoCheckbox = (
    <label className="flex items-center gap-2 text-sm font-medium text-marine cursor-pointer select-none">
      <input
        type="checkbox"
        checked={gabaritoOnly}
        onChange={(e) => setGabaritoOnly(e.target.checked)}
        className="w-4 h-4 accent-marine cursor-pointer"
      />
      Só com gabarito
    </label>
  );

  return (
    <DashCardContext.Provider
      value={{
        title: dashProva.title,
        entities: filteredProvas,
        /*
          ⚠️ `setProvas`, e **não** `() => {}`. O `DashListTemplate` nunca
          escreve em `entities`, então na prática este campo não é chamado; uma
          função vazia esconderia o bug do par `entities filtrado` +
          `setEntities da lista bruta` no dia em que a tela voltasse ao V1.
        */
        setEntities: setProvas,
        onClickCard,
        getMoreCards,
        onLoadMore: loadMoreProvas,
        cardTransformation,
        limitCards,
        filterProps,
        selectFiltes,
        totalItems: filteredProvas.length,
      }}
    >
      <DashListTemplate<Prova>
        columns={colunasDeProva}
        actions={{
          primary: acaoPrimaria,
          secondary: acoesSecundarias,
          overflow: acoesOverflow,
        }}
        filters={GabaritoCheckbox}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearFilters}
        defaultSort={ORDENACAO_PADRAO}
      />
      <ModalNewProva />
      <ModalShowProva />
      <ModalManageCategorias />
      <ModalManageTemplate />
      <UploadCartaoModal
        isOpen={modals.modalUploadCartao.isOpen}
        handleClose={modals.modalUploadCartao.close}
        token={token}
      />
    </DashCardContext.Provider>
  );
}

export default DashProva;
