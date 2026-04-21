import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FilterProps } from "../../components/atoms/filter";
import { SelectProps } from "../../components/atoms/select";
import { OptionProps } from "../../components/atoms/selectOption";
import { ButtonProps } from "../../components/molecules/button";
import { CardDash } from "../../components/molecules/cardDash";
import DashCardTemplate from "../../components/templates/dashCardTemplate";
import { DashCardContext } from "../../context/dashCardContext";
import { Prova } from "../../dtos/prova/prova";
import { ITipoSimulado } from "../../dtos/simulado/tipoSimulado";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { Roles } from "../../enums/roles/roles";
import { getProvas } from "../../services/prova/getProvas";
import { getSyncReport } from "../../services/prova/getSyncReport";
import { startSync } from "../../services/prova/startSync";
import { getTipos } from "../../services/tipoSimulado/getTipos";
import { useAuthStore } from "../../store/auth";
import { useToastAsync } from "../../hooks/useToastAsync";
import { formatDate } from "../../utils/date";
import { Paginate } from "../../utils/paginate";
import { dashProva } from "./data";
import NewProva from "./modals/newProva";
import ShowProva from "./modals/showProva";
import { downloadSyncReportPdf } from "./utils/syncReportPdf";
import { useModals } from "@/hooks/useModal";

const EDICAO_ALL = "";
const APLICACAO_ALL = "";
const ANO_ALL = "";

function DashProva() {
  const [provas, setProvas] = useState<Prova[]>([]);
  const [provaSelected, setProvaSelected] = useState<Prova | null>(null);

  const [tipoSimulado, setTipoSimulado] = useState<ITipoSimulado[]>();

  const [nameFilter, setNameFilter] = useState<string>("");
  const [edicaoFilter, setEdicaoFilter] = useState<string>(EDICAO_ALL);
  const [aplicacaoFilter, setAplicacaoFilter] =
    useState<string>(APLICACAO_ALL);
  const [anoFilter, setAnoFilter] = useState<string>(ANO_ALL);
  const [gabaritoOnly, setGabaritoOnly] = useState<boolean>(false);
  const [resetKey, setResetKey] = useState<number>(0);

  const limitCards = 500;

  const modals = useModals([
    'modalNewProva',
    'modalShowProva',
  ]);

  const {
    data: { token, permissao },
  } = useAuthStore();

  const execute = useToastAsync();

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
        tipos={tipoSimulado!}
        addProva={addProva}
        handleClose={() => modals.modalNewProva.close()}
        isOpen={modals.modalNewProva.isOpen}
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
            prev.map((p) => (p._id === updated._id ? updated : p))
            );
          setProvaSelected(updated);
        }}
      />
    );
  };

  useEffect(() => {
    getProvas(token, 1, limitCards)
      .then((res) => {
        setProvas(res.data);
      })
      .catch((erro: Error) => {
        toast.error(erro.message);
      });

    getTipos(token)
      .then((res) => {
        setTipoSimulado(res.data);
      })
      .catch((erro: Error) => {
        toast.error(erro.message);
      });
  }, [token]);

  const getMoreCards = async (page: number): Promise<Paginate<Prova>> => {
    return await getProvas(token, page, limitCards);
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
  }, [provas, nameFilter, edicaoFilter, aplicacaoFilter, anoFilter, gabaritoOnly]);

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

  const hasActiveFilters =
    nameFilter !== "" ||
    edicaoFilter !== EDICAO_ALL ||
    aplicacaoFilter !== APLICACAO_ALL ||
    anoFilter !== ANO_ALL ||
    gabaritoOnly;

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
          toast.info("Sincronizacao ainda em andamento. Tente novamente em instantes.");
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

  const clearFilters = () => {
    setNameFilter("");
    setEdicaoFilter(EDICAO_ALL);
    setAplicacaoFilter(APLICACAO_ALL);
    setAnoFilter(ANO_ALL);
    setGabaritoOnly(false);
    setResetKey((k) => k + 1);
  };

  const buttons: ButtonProps[] = [
    {
      disabled: !permissao[Roles.cadastrarProvas],
      onClick: handleSync,
      typeStyle: "primary",
      size: "small",
      children: "Sincronizar",
    },
    {
      disabled: !permissao[Roles.visualizarProvas],
      onClick: handleSyncReport,
      typeStyle: "secondary",
      size: "small",
      children: "Relatorio Sync",
    },
    {
      disabled: !permissao[Roles.cadastrarProvas],
      onClick: () => {
        setProvaSelected(null);
        modals.modalNewProva.open();
      },
      typeStyle: "quaternary",
      size: "small",
      children: "Nova Prova",
    },
    {
      disabled: !hasActiveFilters,
      onClick: clearFilters,
      typeStyle: "refused",
      size: "small",
      children: "Limpar filtros",
    },
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
        setEntities: setProvas,
        onClickCard,
        getMoreCards,
        cardTransformation,
        limitCards,
        filterProps,
        selectFiltes,
        buttons,
        totalItems: filteredProvas.length,
      }}
    >
      <DashCardTemplate key={resetKey} customFilter={[GabaritoCheckbox]} />
      <ModalNewProva />
      <ModalShowProva />
    </DashCardContext.Provider>
  );
}

export default DashProva;
