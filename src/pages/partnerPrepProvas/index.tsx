import { DashListTemplate, type DashAction } from "@/components/dashV2";
import { useModals } from "@/hooks/useModal";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { FilterProps } from "../../components/atoms/filter";
import { SelectProps } from "../../components/atoms/select";
import { OptionProps } from "../../components/atoms/selectOption";
import { CardDash } from "../../components/molecules/cardDash";
import { DashCardContext } from "../../context/dashCardContext";
import { ICategoria } from "../../dtos/categoria/categoria";
import { Prova } from "../../dtos/prova/prova";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { Roles } from "../../enums/roles/roles";
import { getCategorias } from "../../services/categoria/getCategorias";
import { createProvaCursinho } from "../../services/prova/createProvaCursinho";
import { getProvasCursinho } from "../../services/prova/getProvasCursinho";
import { useAuthStore } from "../../store/auth";
import { formatDate } from "../../utils/date";
import { Paginate } from "../../utils/paginate";
import { colunasDeProva } from "../dashProvas/columns";
import ManageCategorias from "../dashProvas/modals/manageCategorias";
import NewProva from "../dashProvas/modals/newProva";
import ShowProva from "../dashProvas/modals/showProva";
import UploadCartaoModal from "../dashProvas/modals/uploadCartaoModal";
import { partnerPrepProva } from "./data";

const EDICAO_ALL = "";
const APLICACAO_ALL = "";
const ANO_ALL = "";

/** Mesma ordenação da `dashProvas` — ver o docblock lá. */
const ORDENACAO_PADRAO = { columnId: "ano", direction: "desc" } as const;

const MOTIVO = {
  cadastrarProvasCursinho: "Requer permissão: cadastrar provas do cursinho",
  visualizarEstudantes: "Requer permissão: visualizar estudantes",
  alterarPermissao: "Requer permissão: alterar permissões",
} as const;

/**
 * Provas do cursinho — a mesma tabela da `dashProvas`, com menos ações.
 *
 * ⚠️ **As colunas são as MESMAS**, importadas de `dashProvas/columns`. Uma
 * cópia divergiria na primeira correção feita só de um lado — e a coluna
 * Categoria já mostrou como esse tipo de defeito passa despercebido.
 *
 * ⚠️ **O recorte por cursinho não é feito aqui.** `getProvasCursinho` bate em
 * `mssimulado/cursinho/prova`, e o `CursinhoResolverService` da api resolve o
 * cursinho **pelo JWT** — não por parâmetro. Não há nada nesta tela que um
 * cursinho possa alterar para ver a prova de outro, e não deve passar a haver.
 *
 * ## O que esta tela NÃO tem, e por quê
 *
 * - **Template do caderno** — só administradores publicam template; o cursinho
 *   consome o que estiver publicado.
 * - **Sincronizar** e **Relatório Sync** — manutenção da base inteira, não de
 *   um cursinho.
 */
function PartnerPrepProvas() {
  const [provas, setProvas] = useState<Prova[]>([]);
  const [provaSelected, setProvaSelected] = useState<Prova | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);

  const [categorias, setCategorias] = useState<ICategoria[]>();

  const [nameFilter, setNameFilter] = useState<string>("");
  const [edicaoFilter, setEdicaoFilter] = useState<string>(EDICAO_ALL);
  const [aplicacaoFilter, setAplicacaoFilter] = useState<string>(APLICACAO_ALL);
  const [anoFilter, setAnoFilter] = useState<string>(ANO_ALL);
  const [gabaritoOnly, setGabaritoOnly] = useState<boolean>(false);

  const limitCards = 500;

  /**
   * ⚠️ **O `DashListTemplate` não usa nada disto** — ele pagina em memória e
   * nunca chama `getMoreCards` nem `onLoadMore`. Parece código morto, e não é:
   * é a rede da reversibilidade, igual à da `dashProvas`. Se sumir daqui,
   * voltar ao V1 reintroduz o defeito do PR #679 — `entities` é a lista
   * DERIVADA `filteredProvas`, e deixar o template escrever nela **apaga do
   * estado** toda prova que o filtro escondeu.
   *
   * O mecanismo segue coberto por `templates/dashCardTemplate/index.test.tsx`.
   */
  const requestedPages = useRef<Set<number>>(new Set<number>());
  const bottomReached = useRef<boolean>(false);

  const modals = useModals([
    "modalNewProva",
    "modalShowProva",
    "modalManageCategorias",
    "modalUploadCartao",
  ]);

  const {
    data: { token, permissao },
  } = useAuthStore();

  /**
   * ⚠️ Continua obrigatório mesmo com colunas explícitas: o
   * `DashCardContextProps` o exige e o template o usa para extrair o `id` da
   * linha clicada. O `status` daqui é a derivação errada do V1 e o V2 não a lê
   * — quem manda na coluna Status é o `status.ts`.
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
    setProvas((prev) => [...prev, data]);
  };

  const ModalNewProva = () => {
    return !modals.modalNewProva.isOpen ? null : (
      <NewProva
        categorias={categorias!}
        addProva={addProva}
        createService={createProvaCursinho}
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

  const ModalShowProva = () => {
    return !modals.modalShowProva.isOpen ? null : (
      <ShowProva
        prova={provaSelected!}
        handleClose={() => modals.modalShowProva.close()}
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
    setCarregando(true);

    getProvasCursinho(token, 1, limitCards)
      .then((res) => {
        setProvas(res.data);
      })
      .catch((erro: Error) => {
        toast.error(erro.message);
      })
      .finally(() => setCarregando(false));

    getCategorias(token)
      .then((res) => {
        setCategorias(res.data);
      })
      .catch((erro: Error) => {
        toast.error(erro.message);
      });
  }, [token]);

  const getMoreCards = async (page: number): Promise<Paginate<Prova>> => {
    return await getProvasCursinho(token, page, limitCards);
  };

  const loadMoreProvas = (page: number) => {
    if (page < 1) return;
    if (bottomReached.current || requestedPages.current.has(page)) return;
    requestedPages.current.add(page);

    getProvasCursinho(token, page, limitCards)
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

  const activeFilterCount = [
    nameFilter !== "",
    edicaoFilter !== EDICAO_ALL,
    aplicacaoFilter !== APLICACAO_ALL,
    anoFilter !== ANO_ALL,
    gabaritoOnly,
  ].filter(Boolean).length;

  /**
   * ⚠️ **Sem `key={resetKey}`.** O V1 remontava o template inteiro para limpar
   * os filtros, descartando ordenação, página e posição de rolagem junto. Os
   * controles aqui são controlados, e limpar filtro limpa só filtro.
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
      disabledReason: permitido ? undefined : motivo,
    };
  }

  const acaoPrimaria = acao(
    "nova-prova",
    "Nova Prova",
    permissao[Roles.cadastrarProvasCursinho],
    MOTIVO.cadastrarProvasCursinho,
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
      ⚠️ **Fica desabilitada para praticamente todo mundo desta tela, e é
      esperado.** Categoria é configuração global da plataforma e o botão exige
      `alterarPermissao`, que colaborador de cursinho não tem — então o que
      aparece aqui é o botão inerte com o motivo no tooltip.

      Mantida por decisão do time, para a tela do cursinho espelhar a da
      administração. A permissão é a MESMA da `dashProvas`: se um dia ela for
      revista, tem que ser revista nos dois lugares.
    */
    acao(
      "gerenciar-categorias",
      "Gerenciar Categorias",
      permissao[Roles.alterarPermissao],
      MOTIVO.alterarPermissao,
      () => modals.modalManageCategorias.open(),
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
        title: partnerPrepProva.title,
        entities: filteredProvas,
        /*
          ⚠️ O setter REAL, não `() => {}`. O template do V2 nunca o chama; uma
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
        }}
        filters={GabaritoCheckbox}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearFilters}
        defaultSort={ORDENACAO_PADRAO}
        state={carregando ? "loading" : "idle"}
      />
      <ModalNewProva />
      <ModalShowProva />
      <ModalManageCategorias />
      <UploadCartaoModal
        isOpen={modals.modalUploadCartao.isOpen}
        handleClose={modals.modalUploadCartao.close}
        token={token}
      />
    </DashCardContext.Provider>
  );
}

export default PartnerPrepProvas;
