import { DashListTemplate, type DashAction } from "@/components/dashV2";
import { useModals } from "@/hooks/useModal";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { createCategoriaCursinho } from "../../services/categoria/createCategoriaCursinho";
import { deleteCategoriaCursinho } from "../../services/categoria/deleteCategoriaCursinho";
import { getCategoriasCursinho } from "../../services/categoria/getCategoriasCursinho";
import { createProvaCursinho } from "../../services/prova/createProvaCursinho";
import { getProvasCursinho } from "../../services/prova/getProvasCursinho";
import { DASH, PARTNER_PROVAS, RELATORIO_SIMULADO } from "../../routes/path";
import { useAuthStore } from "../../store/auth";
import { formatDate } from "../../utils/date";
import { Paginate } from "../../utils/paginate";
import { colunasDeProva } from "../dashProvas/columns";
import ManageCategorias from "../dashProvas/modals/manageCategorias";
import type { CriarCategoriaService } from "../dashProvas/modals/manageCategorias/createForm";
import NewProva from "../dashProvas/modals/newProva";
import ShowProva from "../dashProvas/modals/showProva";
import UploadCartaoModal from "../dashProvas/modals/uploadCartaoModal";
import type {
  EstadoDeVolta,
  LocationStateDoRelatorio,
  VoltaParaListagem,
} from "../relatorioSimulado/voltar";
import { partnerPrepProva } from "./data";

const EDICAO_ALL = "";
const APLICACAO_ALL = "";
const ANO_ALL = "";

/** Mesma ordenação da `dashProvas` — ver o docblock lá. */
const ORDENACAO_PADRAO = { columnId: "ano", direction: "desc" } as const;

const MOTIVO = {
  cadastrarProvasCursinho: "Requer permissão: cadastrar provas do cursinho",
  visualizarEstudantes: "Requer permissão: visualizar estudantes",
  gerenciarCategoriasCursinho:
    "Requer permissão: gerenciar categorias do cursinho",
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
/**
 * Ponte entre o contrato do formulário e o serviço do cursinho.
 *
 * ⚠️ **Fora do componente de propósito.** Uma arrow inline mudaria de
 * identidade a cada render; `listarService` entra num array de dependências do
 * `ManageCategorias` e viraria laço infinito. Aqui a referência é estável.
 *
 * ⚠️ O `nome` é opcional no contrato do formulário (o modo do admin não o
 * envia) e obrigatório no serviço do cursinho. O formulário já barra nome vazio
 * quando `nomeLivre` está ligado, então este ramo é inalcançável — mas ele
 * **lança** em vez de mandar string vazia. Um `?? ""` silencioso viraria um 400
 * do backend com mensagem que não ajuda ninguém.
 */
const criarCategoriaDoCursinho: CriarCategoriaService = (input, token) => {
  if (!input.nome?.trim()) {
    throw new Error("Nome da categoria é obrigatório");
  }
  return createCategoriaCursinho({ ...input, nome: input.nome.trim() }, token);
};

/**
 * O `de` veio da **listagem de provas** (e não da tela de turma), e traz tudo
 * o que esta tela precisa para se remontar. Ver `relatorioSimulado/voltar.ts`.
 *
 * ⚠️ **A guarda promete um pouco mais do que checa**: ela olha só a presença
 * dos três campos, não o miolo de `filtros` — um `{ filtros: {} }` passa e
 * `de.filtros.nome` fica tipado `string` valendo `undefined`. Só dá para
 * chegar aí com `history.state` forjado à mão; validar campo a campo aqui
 * seria pagar esquema de runtime por um ataque que não existe. Fica escrito
 * para ninguém ler a assinatura como validação.
 */
function restauracaoCompleta(
  de: EstadoDeVolta | undefined,
): de is VoltaParaListagem {
  return !!de?.filtros && !!de.provaId && de.pagina !== undefined;
}

function PartnerPrepProvas() {
  const [provas, setProvas] = useState<Prova[]>([]);
  const [provaSelected, setProvaSelected] = useState<Prova | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);

  const [categorias, setCategorias] = useState<ICategoria[]>();

  /**
   * De onde a pessoa está voltando. O relatório do simulado é **rota**, e não
   * modal — foi o preço de ter link compartilhável e página imprimível. Este
   * `state` é o troco: sem ele a volta cai numa listagem sem filtro, na página
   * 1 e sem modal. O contrato mora em `relatorioSimulado/voltar.ts`, para as
   * duas pontas não divergirem em silêncio.
   */
  const location = useLocation();
  const deBruto = (location.state as LocationStateDoRelatorio | null)?.de;

  /**
   * ⚠️ **A guarda que o tipo não tem como impor.** O `EstadoDeVolta` é união
   * (ou vêm os três, ou nenhum) e isso segura os *call sites*; aqui não há
   * call site nenhum — `location.state` é `any` e chega do histórico do
   * navegador, que pode trazer qualquer coisa, inclusive um `de` de uma versão
   * antiga da aplicação.
   *
   * Nesta tela os três andam JUNTOS: restaurar meia volta (filtro sem página,
   * página sem modal) é pior que não restaurar, porque a pessoa não tem como
   * saber qual metade voltou. Ou vem tudo, ou não se restaura nada.
   */
  const de = restauracaoCompleta(deBruto) ? deBruto : undefined;

  /**
   * ⚠️ **Os filtros voltam no PRIMEIRO render**, pelo inicializador do
   * `useState`, e nunca por um `useEffect`. Com efeito, a tela pinta uma vez
   * sem filtro e só então filtra — a pessoa vê a lista inteira piscar. E pior:
   * o `activeFilterCount` sairia de 0 para N num render posterior, o que o
   * `DashListTemplate` lê como "trocou o filtro" e responde voltando para a
   * página 1 — destruindo a página que este mesmo state acabou de restaurar.
   */
  const [nameFilter, setNameFilter] = useState<string>(de?.filtros.nome ?? "");
  const [edicaoFilter, setEdicaoFilter] = useState<string>(
    de?.filtros.edicao ?? EDICAO_ALL,
  );
  const [aplicacaoFilter, setAplicacaoFilter] = useState<string>(
    de?.filtros.aplicacao ?? APLICACAO_ALL,
  );
  const [anoFilter, setAnoFilter] = useState<string>(
    de?.filtros.ano ?? ANO_ALL,
  );
  const [gabaritoOnly, setGabaritoOnly] = useState<boolean>(
    de?.filtros.gabaritoOnly ?? false,
  );

  /**
   * A página em que a listagem abre (semente do template) e a página corrente
   * (o que vai no `state` quando a pessoa sai para o relatório). São duas
   * coisas: a primeira é lida uma vez na montagem, a segunda muda a cada
   * navegação pelo rodapé.
   */
  const [paginaRestaurada] = useState<number>(de?.pagina ?? 1);
  const [paginaAtual, setPaginaAtual] = useState<number>(de?.pagina ?? 1);

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

  const navigate = useNavigate();

  /**
   * ⚠️ Rota nova, fora do modal. O relatório é uma tela cheia — cabe tabela,
   * resumo e abas, e é imprimível; nada disso cabe nos 672px do `ShowProva`.
   */
  const abrirRelatorio = (simuladoId: string) => {
    const deAqui: EstadoDeVolta = {
      caminho: `${DASH}/${PARTNER_PROVAS}`,
      filtros: {
        nome: nameFilter,
        edicao: edicaoFilter,
        aplicacao: aplicacaoFilter,
        ano: anoFilter,
        gabaritoOnly,
      },
      provaId: provaSelected!._id,
      pagina: paginaAtual,
    };
    navigate(`${DASH}/${RELATORIO_SIMULADO}/${simuladoId}`, {
      state: { de: deAqui },
    });
  };

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
        listarService={getCategoriasCursinho}
        criarService={criarCategoriaDoCursinho}
        excluirService={deleteCategoriaCursinho}
        nomeLivre
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
        /*
          ⚠️ **Só aqui.** A `dashProvas` monta o mesmo `ShowProva` e NÃO passa
          esta prop: lá o usuário é admin de plataforma e pode não ter cursinho
          nenhum, e a api resolve o cursinho pelo JWT — a chamada voltaria 403.
          Ver o docblock de `AcaoRelatorio` em `dashProvas/modals/simuladosView`.

          ⚠️ E a permissão é um segundo gate, mais baixo: `gerenciarEstudantes`
          pode existir para um admin, então ela desabilita com motivo — nunca
          decide em qual tela a ação aparece.
        */
        relatorio={{
          permitido: !!permissao[Roles.gerenciarEstudantes],
          aoAbrir: (simulado) => abrirRelatorio(simulado._id),
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

    getCategoriasCursinho(token)
      .then((res) => {
        setCategorias(res.data);
      })
      .catch((erro: Error) => {
        toast.error(erro.message);
      });
  }, [token]);

  /**
   * A outra metade da volta: reabrir o `ShowProva` na prova de onde a pessoa
   * saiu.
   *
   * ⚠️ **Espera a lista chegar.** O `onClickCard` faz `provas.find(...)`;
   * restaurar na montagem, com `provas` ainda vazio, acha `undefined` e o
   * `ModalShowProva` entrega `provaSelected!` — uma prova que não existe — ao
   * `ShowProva`. Por isso o guarda de `provas.length === 0`: o efeito roda de
   * novo quando o fetch pousa.
   *
   * ⚠️ **E roda UMA VEZ SÓ.** O `useModals` devolve objetos novos a cada
   * render, então este efeito é reavaliado em todo render; sem o `ref`, fechar
   * o modal restaurado o reabriria na hora, e a pessoa ficaria presa nele.
   */
  const jaRestaurou = useRef(false);
  useEffect(() => {
    if (jaRestaurou.current || !de || provas.length === 0) return;
    jaRestaurou.current = true;

    /*
      Prova que saiu da lista (excluída, ou fora do recorte que o cursinho
      enxerga agora) simplesmente não reabre modal nenhum — os filtros e a
      página já foram restaurados, que é o grosso do caminho de volta.
    */
    const prova = provas.find((p) => p._id === de.provaId);
    if (prova) {
      setProvaSelected(prova);
      modals.modalShowProva.open();
    }

    /*
      ⚠️ **Consumir o state.** Sem esta limpeza ele fica grudado na entrada do
      histórico, e um `navigate` posterior para esta mesma rota ressuscita
      filtros que a pessoa já trocou. `replace` para não empilhar uma entrada
      nova no histórico e transformar o "voltar" do navegador em nada.
    */
    navigate(location.pathname, { replace: true, state: null });
  }, [de, provas, navigate, location.pathname, modals]);

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
      ⚠️ **Deixou de ser o botão permanentemente inerte** que a migração desta
      tela trouxe. Agora ele exige `gerenciarCategoriasCursinho` — permissão do
      cursinho, e não a `alterarPermissao` da administração de papéis, que
      nenhum colaborador tem e que não tem relação com o que o botão faz.

      As categorias que ele gerencia são as DO CURSINHO: a listagem, a criação
      e a exclusão passam pelas rotas escopadas, e o dono é resolvido pelo JWT
      na api.
    */
    acao(
      "gerenciar-categorias",
      "Gerenciar Categorias",
      permissao[Roles.gerenciarCategoriasCursinho],
      MOTIVO.gerenciarCategoriasCursinho,
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
        /*
          ⚠️ O par da Task 8: a semente entra uma vez (a página de onde a
          pessoa saiu) e o retorno mantém `paginaAtual` em dia para a próxima
          ida ao relatório. O template só avisa a navegação do USUÁRIO — o
          reset por troca de filtro é mudo de propósito.
        */
        paginaInicial={paginaRestaurada}
        onPaginaChange={setPaginaAtual}
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
