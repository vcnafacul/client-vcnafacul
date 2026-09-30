import { SelectProps } from "@/components/atoms/select";
import { OptionProps } from "@/components/atoms/selectOption";
import { DashListTemplate, type DashAction } from "@/components/dashV2";
import { DashCardContext } from "@/context/dashCardContext";
import { ContentDtoInput } from "@/dtos/content/contentDtoInput";
import { StatusContent } from "@/enums/content/statusContent";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { Roles } from "@/enums/roles/roles";
import { useModals } from "@/hooks/useModal";
import { getTodoConteudo } from "@/services/content/getContent";
import { getMaterias } from "@/services/content/getMaterias";
import { useAuthStore } from "@/store/auth";
import { Paginate } from "@/utils/paginate";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { colunasDeConteudo } from "./columns";
import { cardTransformationContent, dashAllContent } from "./data";
import NewDemand from "./modals/newDemand";
import SettingsFrente from "./modals/settingsFrente";
import ShowDemand from "./modals/showDemand";
import ValidatedDemand from "./modals/validatedDemand";

/** Filtro de matéria vazio = todas. */
export const MATERIA_TODAS = "";
/** A fila de trabalho: o status que a tela abre por padrão. */
export const STATUS_PADRAO = StatusContent.Pending_Upload;

type StatusDaLista = StatusContent | StatusEnum;

/** A api às vezes manda `_id` no lugar de `id` — mesmo contorno do `data.ts`. */
function idDaDemanda(demand: ContentDtoInput): string {
  return demand.id ?? (demand as { _id?: string })._id ?? "";
}

function DashContent() {
  const {
    data: { token, permissao },
  } = useAuthStore();

  const modals = useModals(["showDemand", "newDemand", "settings"]);

  const uploader: boolean = permissao[Roles.uploadDemanda];
  const manager: boolean = permissao[Roles.editarMateriasFrentes];
  const themeManager: boolean = permissao[Roles.gerenciadorDemanda];
  const gerencia = manager || themeManager;

  const [demands, setDemands] = useState<ContentDtoInput[]>([]);
  const [demandSelected, setDemandSelected] = useState<ContentDtoInput | null>(
    null,
  );
  const [materias, setMaterias] = useState<OptionProps[]>([
    { id: MATERIA_TODAS, name: "Todas as matérias" },
  ]);
  const [materiaSelected, setMateriaSelected] =
    useState<string>(MATERIA_TODAS);
  const [status, setStatus] = useState<StatusDaLista>(STATUS_PADRAO);
  const [estado, setEstado] = useState<"idle" | "loading" | "error">(
    "loading",
  );

  useEffect(() => {
    getMaterias(token)
      .then((res) => {
        setMaterias([
          { id: MATERIA_TODAS, name: "Todas as matérias" },
          ...res.map((m) => ({ id: m._id, name: m.nome })),
        ]);
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  }, [token]);

  /*
    ⚠️ **Matéria e status filtram NO SERVIDOR, e só lá.** O V1 filtrava a
    matéria duas vezes — em memória sobre a lista carregada E refazendo a busca
    com `materia` —, e o filtro em memória comparava com a lista antiga até a
    busca voltar.
  */
  const carregar = useCallback(() => {
    let cancelado = false;
    setEstado("loading");
    getTodoConteudo(token, status as StatusContent, materiaSelected)
      .then((lista) => {
        if (cancelado) return;
        setDemands(lista);
        setEstado("idle");
      })
      .catch((error: Error) => {
        if (cancelado) return;
        setEstado("error");
        toast.error(error.message);
      });
    return () => {
      cancelado = true;
    };
  }, [token, status, materiaSelected]);

  useEffect(carregar, [carregar]);

  const onClickCard = (id: number | string) => {
    const found = demands.find((demand) => idDaDemanda(demand) === id);
    if (!found) return;
    setDemandSelected(found);
    modals.showDemand.open();
  };

  /*
    ⚠️ **Recarrega, em vez de acrescentar.** O V1 fazia `push` no array do
    estado e passava a MESMA referência ao `setDemands` — o React não
    re-renderizava e a demanda nova só aparecia no F5. E acrescentar sem olhar o
    status poria a demanda nova numa lista filtrada por outro status.
  */
  const addDemand = () => carregar();

  const handleRemoveDemand = (id: string) => {
    setDemands((prev) => prev.filter((q) => idDaDemanda(q) !== id));
  };

  const ShowDemandModal = () => {
    return modals.showDemand.isOpen &&
      uploader &&
      demandSelected?.status === StatusContent.Pending_Upload ? (
      <ShowDemand
        handleClose={() => modals.showDemand.close()}
        isOpen={
          modals.showDemand.isOpen &&
          demandSelected?.status === StatusContent.Pending_Upload
        }
        demand={demandSelected!}
        updateStatusDemand={handleRemoveDemand}
      />
    ) : null;
  };

  const ValidatedModalDemand = () => {
    const open =
      modals.showDemand.isOpen &&
      (!uploader || demandSelected?.status !== StatusContent.Pending_Upload);
    return open ? (
      <ValidatedDemand
        demand={demandSelected!}
        updateStatusDemand={handleRemoveDemand}
        handleClose={() => modals.showDemand.close()}
        isOpen={open}
      />
    ) : null;
  };

  const NewModalDemand = () => {
    const open = gerencia && modals.newDemand.isOpen;
    return !open ? null : (
      <NewDemand
        addDemand={addDemand}
        handleClose={() => modals.newDemand.close()}
        isOpen={modals.newDemand.isOpen}
      />
    );
  };

  const SettingsModal = () => {
    const open = gerencia && modals.settings.isOpen;
    return !open ? null : (
      <SettingsFrente
        isOpen={modals.settings.isOpen}
        handleClose={() => {
          modals.settings.close();
        }}
      />
    );
  };

  /*
    ⚠️ **As mesmas duas ações do V1, e com a MESMA permissão** (gerenciar
    matérias/frentes OU gerenciar demandas) — quem não tem continua sem vê-las.
    A engrenagem sem rótulo virou ação nomeada: o modal dela gerencia matérias,
    frentes e temas.
  */
  const acoes: { primary?: DashAction; secondary?: DashAction[] } = gerencia
    ? {
        primary: {
          id: "nova-demanda",
          label: "Nova Demanda",
          onClick: () => {
            setDemandSelected(null);
            modals.newDemand.open();
          },
        },
        secondary: [
          {
            id: "materias-e-frentes",
            label: "Matérias e frentes",
            onClick: () => modals.settings.open(),
          },
        ],
      }
    : {};

  /*
    ⚠️ Selects CONTROLADOS (`value`): limpar filtro volta os dois sem remontar
    o template — remontar descartaria a ordenação e a página.
  */
  const selectFiltes: SelectProps[] = [
    {
      "aria-label": "Matéria",
      options: materias,
      value: materiaSelected,
      setState: (valor: string) => setMateriaSelected(valor),
    },
    {
      "aria-label": "Status",
      options: dashAllContent.options,
      value: status,
      // O `<select>` devolve string; o status é numérico no enum.
      setState: (valor: string) => setStatus(Number(valor) as StatusDaLista),
    },
  ];

  /*
    ⚠️ O status sempre tem valor (não existe "Todos"), então só conta como
    filtro ativo quando sai da fila padrão.
  */
  const activeFilterCount = [
    materiaSelected !== MATERIA_TODAS,
    status !== STATUS_PADRAO,
  ].filter(Boolean).length;

  const limparFiltros = () => {
    setMateriaSelected(MATERIA_TODAS);
    setStatus(STATUS_PADRAO);
  };

  /*
    ⚠️ O Provider ainda exige `getMoreCards` e `limitCards`, do V1. O V2 não
    pede mais páginas — a lista inteira já veio do `getTodoConteudo`.
  */
  const semMaisPaginas = async (): Promise<Paginate<ContentDtoInput>> => ({
    data: [],
    page: 1,
    limit: demands.length,
    totalItems: demands.length,
  });

  return (
    <DashCardContext.Provider
      value={{
        title: dashAllContent.title,
        entities: demands,
        setEntities: setDemands,
        onClickCard,
        getMoreCards: semMaisPaginas,
        cardTransformation: cardTransformationContent,
        limitCards: demands.length,
        selectFiltes,
      }}
    >
      <DashListTemplate<ContentDtoInput>
        columns={colunasDeConteudo}
        actions={acoes}
        state={estado}
        onRetry={carregar}
        activeFilterCount={activeFilterCount}
        onClearFilters={limparFiltros}
        defaultSort={{ columnId: "createdAt", direction: "desc" }}
        textoVazio="Nenhuma demanda com este status"
      />
      {/*
        ⚠️ Chamados como função, não como <Componente />: declarados dentro
        do render, cada render criava um "tipo" novo e o React desmontava e
        remontava o modal — refazia o download do arquivo, mostrava a demanda
        antiga e perdia o arquivo escolhido.
      */}
      {ShowDemandModal()}
      {ValidatedModalDemand()}
      {NewModalDemand()}
      {SettingsModal()}
    </DashCardContext.Provider>
  );
}
export default DashContent;
