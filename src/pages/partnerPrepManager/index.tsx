import { CardDash } from "@/components/molecules/cardDash";
import DashCardTemplate from "@/components/templates/dashCardTemplate";
import { DashCardContext } from "@/context/dashCardContext";
import { StatusEnum } from "@/enums/generic/statusEnum";
import getPartnerPrepCourse from "@/services/prepCourse/prepCourse/getPartnerPrepCourse";
import { useAuthStore } from "@/store/auth";
import { PartnerPrepCourse } from "@/types/partnerPrepCourse/partnerPrepCourse";
import { Paginate } from "@/utils/paginate";
import { useEffect, useState } from "react";
import { ModalShowPrepCourse } from "./modals/ModalShowPrepCourse";

export default function PartnerPrepManager() {
  const {
    data: { token },
  } = useAuthStore();

  const [entities, setEntities] = useState<PartnerPrepCourse[]>([]);
  const [entitySelected, setEntitySelected] =
    useState<PartnerPrepCourse | null>(null);
  const [openPrepCourse, setOpenPrepCourse] = useState<boolean>(false);

  const limitCards = 100;

  const getMoreCards = async (
    page: number
  ): Promise<Paginate<PartnerPrepCourse>> =>
    await getPartnerPrepCourse(token, page, limitCards);

  const cardTransformation = (ppc: PartnerPrepCourse): CardDash => ({
    id: ppc.id,
    title: ppc.geo.name,
    status: StatusEnum.Approved,
    infos: [
      { field: "Tipo", value: ppc.geo.category },
      { field: "Local", value: ppc.geo.street + ", " + ppc.geo.number },
      {
        field: "Região",
        value:
          ppc.geo.state + " - " + ppc.geo.city + " - " + ppc.geo.neighborhood,
      },
      { field: "Tel", value: ppc.geo.phone },
      { field: "Coordenador", value: ppc.representative.name },
    ],
    logo: ppc.thumbnail,
    className: "w-96",
  });

  useEffect(() => {
    getPartnerPrepCourse(token, 1, limitCards).then((res) => {
      setEntities(res.data);
    });
  }, [token]);

  const onClickCard = (id: string) => {
    setEntitySelected(entities.find((e) => e.id === id)!);
    setOpenPrepCourse(true);
  };

  const ShowPrepCourse = () => {
    return openPrepCourse ? (
      <ModalShowPrepCourse
        isOpen={openPrepCourse}
        handleClose={() => setOpenPrepCourse(false)}
        prepCourse={entitySelected!}
      />
    ) : null;
  };

  return (
    <DashCardContext.Provider
      value={{
        title: "Gerenciamento de Cursinho",
        entities,
        setEntities,
        onClickCard,
        getMoreCards,
        cardTransformation,
        limitCards,
      }}
    >
      <DashCardTemplate />
      <ShowPrepCourse />
    </DashCardContext.Provider>
  );
}
