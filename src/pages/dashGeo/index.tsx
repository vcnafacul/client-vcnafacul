import { ShadcnTable } from "@/components/atoms/shadcnTable";
import { DashListTemplate, type DashAction } from "@/components/dashV2";
import ModalTabTemplate from "@/components/templates/modalTabTemplate";
import { useToastAsync } from "@/hooks/useToastAsync";
import { createGeolocation } from "@/services/geolocation/createGeolocation";
import { TypeMarker } from "@/types/map/marker";
import { useCallback, useEffect, useState } from "react";
import { CardDash } from "../../components/molecules/cardDash";
import { DashCardContext } from "../../context/dashCardContext";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { getTodasAsGeolocalizacoes } from "../../services/geolocation/getAllGeolocation";
import { Geolocation } from "../../types/geolocation/geolocation";
import { formatDate } from "../../utils/date";
import { mergeObjects } from "../../utils/mergeObjects";
import { Paginate } from "../../utils/paginate";
import { colunasDoGeo, ORDENACAO_PADRAO } from "./columns";
import { dashGeo } from "./data";
import { FiltrosDoGeo } from "./FiltrosDoGeo";
import {
  contarFiltros,
  FILTROS_VAZIOS,
  type FiltrosDoGeo as Filtros,
} from "./filtros";
import ModalCreateDashGeo from "./modals/modalCreateDashGeo";
import ModalEditDashGeo from "./modals/modalEditDashGeo";
import { useModals } from "@/hooks/useModal";
import { useAuthStore } from "@/store/auth";

function DashGeo() {
  const token = useAuthStore((s) => s.data.token);
  const [geolocations, setGeolocations] = useState<Geolocation[]>([]);
  const [geoSelect, setGeoSelect] = useState<Geolocation>();
  // Os filtros vão para o servidor; os campos de texto esperam a digitação parar.
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VAZIOS);
  // Três estados do template V2: o erro vira "tentar de novo" (antes a lista
  // ficava vazia calada).
  const [estado, setEstado] = useState<"idle" | "loading" | "error">("loading");
  const limitCards = 100;

  const modals = useModals([
    'modalEdit',
    'modalCreate',
  ]);

  const executeAsync = useToastAsync();

  const cardTransformation = (geo: Geolocation): CardDash => ({
    id: geo.id,
    title: geo.name,
    status: geo.status,
    infos: [
      {
        field: "Tipo",
        value: geo.type === TypeMarker.geo ? "Cursinho" : "Universidade",
      },
      { field: "Estado", value: geo.state },
      { field: "Cidade", value: geo.city },
      { field: "Data de Cadastro", value: formatDate(geo.createdAt) },
      { field: "Ultima Atualizacao", value: formatDate(geo.updatedAt) },
    ],
  });

  const onClickCard = (cardId: number | string) => {
    setGeoSelect(geolocations.find((geo) => geo.id === cardId));
    modals.modalEdit.open();
  };

  const handleCloseModalEdit = () => {
    modals.modalEdit.close();
  };

  const updateStatus = (cardId: string) => {
    // Em "Todos" o registro continua na lista, só com outro status.
    if (filtros.status === StatusEnum.All) {
      carregar();
      return;
    }
    const updatedGeo = geolocations.filter((geo) => {
      if (geo.id !== cardId) return geo;
    });
    setGeolocations(updatedGeo);
  };

  const updateGeolocation = (geolocation: Geolocation) => {
    setGeolocations(
      geolocations.map((geo) => {
        if (geo.id === geolocation.id) return mergeObjects(geolocation, geo);
        return geo;
      })
    );
    setGeoSelect(geolocation);
  };

  const handleCreate = async (geo: Geolocation) => {
    await executeAsync({
      action: () => createGeolocation({ ...geo }),
      loadingMessage: "Criando Universidade...",
      successMessage: "Universidade criada com sucesso",
      errorMessage: (error: Error) => error.message,
      onSuccess: (res: Geolocation) => {
        setGeolocations([res, ...geolocations]);
      },
    });
  };

  const ModalCreate = () => {
    return !modals.modalCreate.isOpen ? null : (
      <ModalCreateDashGeo
        isOpen={modals.modalCreate.isOpen}
        handleClose={() => modals.modalCreate.close()}
        createGeo={handleCreate}
        type={TypeMarker.univPublic}
      />
    );
  };

  const ModalEdit = () => {
    return !modals.modalEdit.isOpen ? null : (
      <ModalTabTemplate
        isOpen={modals.modalEdit.isOpen}
        className="px-3 sm:px-8 py-4 rounded-md relative h-[90vh] supports-[height:100dvh]:h-[90dvh] w-[90vw] overflow-y-auto scrollbar-hide"
        tabs={[
          {
            label: "Detalhes",
            id: "detalhes",
            children: (
              <ModalEditDashGeo
                rawGeo={geoSelect!}
                updateStatus={updateStatus}
                updateGeo={updateGeolocation}
                isOpen={modals.modalEdit.isOpen}
                handleClose={handleCloseModalEdit}
              />
            ),
            handleClose: handleCloseModalEdit,
          },
          {
            label: "Historico",
            id: "historico",
            children: (
              <div>
                <ShadcnTable
                  headers={["Data", "Status", "Descrição", "Usuario", "Email"]}
                  cells={
                    geoSelect!.logs?.map((log) => [
                      formatDate(log?.createdAt?.toString()),
                      log?.status,
                      log?.description,
                      log?.user?.firstName + " " + log?.user?.lastName,
                      log?.user?.email,
                    ]) || []
                  }
                />
              </div>
            ),
            handleClose: handleCloseModalEdit,
          },
        ]}
      />
    );
  };

  const carregar = useCallback(async () => {
    setEstado("loading");
    try {
      setGeolocations(await getTodasAsGeolocalizacoes(token, filtros));
      setEstado("idle");
    } catch {
      setEstado("error");
    }
  }, [token, filtros]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // O V2 não pagina pelo servidor; o Provider ainda exige a função.
  const getMoreCards = async (): Promise<Paginate<Geolocation>> => ({
    data: [],
    page: 0,
    limit: 0,
    totalItems: 0,
  });

  const acaoPrimaria: DashAction = {
    id: "nova-universidade",
    label: "Nova universidade",
    onClick: () => modals.modalCreate.open(),
  };

  return (
    <DashCardContext.Provider
      value={{
        title: dashGeo.title,
        entities: geolocations,
        setEntities: setGeolocations,
        onClickCard,
        getMoreCards,
        cardTransformation,
        limitCards,
        totalItems: geolocations.length,
      }}
    >
      <DashListTemplate<Geolocation>
        columns={colunasDoGeo}
        actions={{ primary: acaoPrimaria }}
        filters={<FiltrosDoGeo valor={filtros} onChange={setFiltros} />}
        activeFilterCount={contarFiltros(filtros)}
        onClearFilters={() => setFiltros(FILTROS_VAZIOS)}
        defaultSort={ORDENACAO_PADRAO}
        state={estado}
        onRetry={carregar}
        textoVazio="Nenhum registro pendente"
      />
      {/*
        Como função, não <Componente />: declarados no render, remontavam a
        cada atualização da lista (ex.: aprovar muda a lista → o modal de
        edição remontava e perdia o que estava sendo editado).
      */}
      {ModalEdit()}
      {ModalCreate()}
    </DashCardContext.Provider>
  );
}

export default DashGeo;
