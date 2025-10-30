import { ShadcnTable } from "@/components/atoms/shadcnTable";
import { ButtonProps } from "@/components/molecules/button";
import ModalTabTemplate from "@/components/templates/modalTabTemplate";
import { useToastAsync } from "@/hooks/useToastAsync";
import { createGeolocation } from "@/services/geolocation/createGeolocation";
import { TypeMarker } from "@/types/map/marker";
import { useCallback, useEffect, useState } from "react";
import { FilterProps } from "../../components/atoms/filter";
import { SelectProps } from "../../components/atoms/select";
import { CardDash } from "../../components/molecules/cardDash";
import DashCardTemplate from "../../components/templates/dashCardTemplate";
import { DashCardContext } from "../../context/dashCardContext";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { getAllGeolocation } from "../../services/geolocation/getAllGeolocation";
import { Geolocation } from "../../types/geolocation/geolocation";
import { formatDate } from "../../utils/date";
import { mergeObjects } from "../../utils/mergeObjects";
import { Paginate } from "../../utils/paginate";
import { dashGeo } from "./data";
import ModalCreateDashGeo from "./modals/modalCreateDashGeo";
import ModalEditDashGeo from "./modals/modalEditDashGeo";
import { useModals } from "@/hooks/useModal";

function DashGeo() {
  const [status, setStatus] = useState<StatusEnum>(StatusEnum.Pending);
  const [geolocations, setGeolocations] = useState<Geolocation[]>([]);
  const [geoSelect, setGeoSelect] = useState<Geolocation>();
  const [filterText, setFilterText] = useState<string>("");
  const [enterText, setEnterText] = useState<string>("");
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
        className="px-8 py-4 rounded-md  relative h-[90vh] w-[90vw] overflow-y-auto scrollbar-hide"
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

  const getGeolocations = useCallback(
    async (status: StatusEnum, text: string) => {
      getAllGeolocation(status, 1, limitCards, text)
        .then((res) => {
          setGeolocations(res.data);
        })
        .catch(() => setGeolocations([]));
    },
    []
  );

  const getMoreCards = async (page: number): Promise<Paginate<Geolocation>> => {
    return await getAllGeolocation(status, page, limitCards);
  };

  const selectFiltes: SelectProps[] = [
    { options: dashGeo.options, defaultValue: status, setState: setStatus },
  ];

  const filterProps: FilterProps = {
    filtrar: (e: React.ChangeEvent<HTMLInputElement>) =>
      setFilterText(e.target.value.toLowerCase()),
    placeholder: "nome | estado | cidade | email | categoria",
    defaultValue: filterText,
    keyDown: () => setEnterText(filterText),
  };

  useEffect(() => {
    getGeolocations(status, enterText);
  }, [status, getGeolocations, enterText]);

  const buttons: ButtonProps[] = [
    {
      onClick: () => {
        modals.modalCreate.open();
      },
      typeStyle: "quaternary",
      size: "small",
      children: "Criar Universidade",
    },
  ];

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
        selectFiltes,
        filterProps,
        buttons,
      }}
    >
      <DashCardTemplate />
      <ModalEdit />
      <ModalCreate />
    </DashCardContext.Provider>
  );
}

export default DashGeo;
