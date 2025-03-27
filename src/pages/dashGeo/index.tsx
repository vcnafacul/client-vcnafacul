import { TypeMarker } from "@/types/map/marker";
import { ShadcnTable } from "@/components/atoms/shadcnTable";
import ModalTabTemplate from "@/components/templates/modalTabTemplate";
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
import ModalEditDashGeo from "./modals/modalEditDashGeo";

function DashGeo() {
  const [status, setStatus] = useState<StatusEnum>(StatusEnum.Pending);
  const [geolocations, setGeolocations] = useState<Geolocation[]>([]);
  const [geoSelect, setGeoSelect] = useState<Geolocation>();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [filterText, setFilterText] = useState<string>("");
  const [enterText, setEnterText] = useState<string>("");
  const limitCards = 100;

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
    setOpenModal(true);
  };

  const handleCloseModalEdit = () => {
    setOpenModal(false);
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

  const ModalEdit = () => {
    return !openModal ? null : (
      <ModalTabTemplate
        isOpen={openModal}
        className="p-8 rounded-md  relative h-[90vh] w-[90vw] overflow-y-auto scrollbar-hide"
        tabs={[
          {
            label: "Detalhes",
            id: "detalhes",
            children: (
              <ModalEditDashGeo
                geo={geoSelect!}
                updateStatus={updateStatus}
                updateGeo={updateGeolocation}
                isOpen={openModal}
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
      }}
    >
      <DashCardTemplate />
      <ModalEdit />
    </DashCardContext.Provider>
  );
}

export default DashGeo;
