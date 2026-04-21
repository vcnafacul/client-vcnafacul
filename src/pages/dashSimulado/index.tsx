import { useEffect, useMemo, useState } from "react";
import { FilterProps } from "../../components/atoms/filter";
import { SelectProps } from "../../components/atoms/select";
import { OptionProps } from "../../components/atoms/selectOption";
import { ButtonProps } from "../../components/molecules/button";
import { CardDash } from "../../components/molecules/cardDash";
import DashCardTemplate from "../../components/templates/dashCardTemplate";
import { DashCardContext } from "../../context/dashCardContext";
import { ISimuladoDTO } from "../../dtos/simulado/simuladoDto";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { useToastAsync } from "../../hooks/useToastAsync";
import { getSimulados } from "../../services/simulado/getSimulados";
import { useAuthStore } from "../../store/auth";
import { formatDate } from "../../utils/date";
import { Paginate } from "../../utils/paginate";

const BLOQUEADO_ALL = "all";
const BLOQUEADO_BLOCKED = "blocked";
const BLOQUEADO_UNBLOCKED = "unblocked";

const bloqueadoOptions: OptionProps[] = [
  { id: BLOQUEADO_ALL, name: "Todos" },
  { id: BLOQUEADO_BLOCKED, name: "Bloqueados" },
  { id: BLOQUEADO_UNBLOCKED, name: "Liberados" },
];

function DashSimulado() {
  const [simulados, setSimulados] = useState<ISimuladoDTO[]>([]);
  const [nameFilter, setNameFilter] = useState<string>("");
  const [tipoFilter, setTipoFilter] = useState<string>("");
  const [bloqueadoFilter, setBloqueadoFilter] =
    useState<string>(BLOQUEADO_ALL);
  const [resetKey, setResetKey] = useState<number>(0);
  const {
    data: { token },
  } = useAuthStore();
  const executeAsync = useToastAsync();
  const limitCards = 500;

  const cardTransformation = (simulado: ISimuladoDTO): CardDash => ({
    id: simulado._id,
    title: simulado.nome,
    status: simulado.bloqueado ? StatusEnum.Rejected : StatusEnum.Approved,
    infos: [
      { field: "Tipo", value: simulado.tipo.nome },
      {
        field: "Duracao",
        value: simulado.tipo.duracao.toString() + " minutos",
      },
      {
        field: "Questoes",
        value: `${simulado.questoes.length.toString()}/${simulado.tipo.quantidadeTotalQuestao.toString()}`,
      },
      {
        field: "Descrição",
        value:
          simulado.descricao && simulado.descricao.length > 20
            ? simulado.descricao.substring(0, 20) + "..."
            : simulado.descricao,
      },
      {
        field: "Atualizado em ",
        value: simulado.updatedAt
          ? formatDate(simulado.updatedAt.toString())
          : "",
      },
    ],
  });

  useEffect(() => {
    executeAsync({
      action: () => getSimulados(token, 1, limitCards),
      loadingMessage: "Buscando Simulados...",
      successMessage: "Simulados carregados com sucesso!",
      errorMessage: (error) => error.message,
      onSuccess: (res) => setSimulados(res.data),
      onError: () => setSimulados([]),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const getMoreCards = async (
    page: number
  ): Promise<Paginate<ISimuladoDTO>> => {
    return await getSimulados(token, page, limitCards);
  };

  const tipoOptions: OptionProps[] = useMemo(() => {
    const names = new Set<string>();
    simulados.forEach((s) => {
      if (s.tipo?.nome) names.add(s.tipo.nome);
    });
    return [
      { id: "", name: "Todos os tipos" },
      ...Array.from(names)
        .sort((a, b) => a.localeCompare(b))
        .map((n) => ({ id: n, name: n })),
    ];
  }, [simulados]);

  const filteredSimulados = useMemo(() => {
    const term = nameFilter.trim().toLowerCase();
    return simulados.filter((s) => {
      if (term && !s.nome.toLowerCase().includes(term)) return false;
      if (tipoFilter && s.tipo?.nome !== tipoFilter) return false;
      if (bloqueadoFilter === BLOQUEADO_BLOCKED && !s.bloqueado) return false;
      if (bloqueadoFilter === BLOQUEADO_UNBLOCKED && s.bloqueado) return false;
      return true;
    });
  }, [simulados, nameFilter, tipoFilter, bloqueadoFilter]);

  const filterProps: FilterProps = {
    placeholder: "Buscar por nome",
    filtrar: (e: React.ChangeEvent<HTMLInputElement>) =>
      setNameFilter(e.target.value),
    defaultValue: nameFilter,
  };

  const selectFiltes: SelectProps[] = [
    {
      options: tipoOptions,
      defaultValue: tipoFilter,
      setState: (value: string) => setTipoFilter(value),
    },
    {
      options: bloqueadoOptions,
      defaultValue: bloqueadoFilter,
      setState: (value: string) => setBloqueadoFilter(value),
    },
  ];

  const hasActiveFilters =
    nameFilter !== "" || tipoFilter !== "" || bloqueadoFilter !== BLOQUEADO_ALL;

  const buttons: ButtonProps[] = [
    {
      onClick: () => {
        setNameFilter("");
        setTipoFilter("");
        setBloqueadoFilter(BLOQUEADO_ALL);
        setResetKey((k) => k + 1);
      },
      typeStyle: "quaternary",
      size: "small",
      disabled: !hasActiveFilters,
      children: "Limpar filtros",
    },
  ];

  return (
    <DashCardContext.Provider
      value={{
        title: "Simulados",
        entities: filteredSimulados,
        setEntities: setSimulados,
        onClickCard: () => {},
        getMoreCards,
        cardTransformation,
        limitCards,
        filterProps,
        selectFiltes,
        buttons,
        totalItems: filteredSimulados.length,
      }}
    >
      <DashCardTemplate key={resetKey} />
    </DashCardContext.Provider>
  );
}

export default DashSimulado;
