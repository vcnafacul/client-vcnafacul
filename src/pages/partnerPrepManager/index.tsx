import { ButtonProps } from "@/components/molecules/button";
import { CardDash } from "@/components/molecules/cardDash";
import DashCardTemplate from "@/components/templates/dashCardTemplate";
import { DashCardContext } from "@/context/dashCardContext";
import { StatusEnum } from "@/enums/generic/statusEnum";
import getPartnerPrepCourse from "@/services/prepCourse/prepCourse/getPartnerPrepCourse";
import { useAuthStore } from "@/store/auth";
import { PartnerPrepCourse } from "@/types/partnerPrepCourse/partnerPrepCourse";
import { Paginate } from "@/utils/paginate";
import { useEffect, useState } from "react";
import { BiPlusCircle } from "react-icons/bi";
import { ModalCreatePrepCourse } from "./modals/ModalCreatePrepCourse";
import { ModalShowPrepCourse } from "./modals/ModalShowPrepCourse";

export default function PartnerPrepManager() {
  const {
    data: { token },
  } = useAuthStore();

  const [entities, setEntities] = useState<PartnerPrepCourse[]>([]);
  const [entitySelected, setEntitySelected] =
    useState<PartnerPrepCourse | null>(null);
  const [openPrepCourse, setOpenPrepCourse] = useState<boolean>(false);
  const [openCreatePrepCourse, setOpenCreatePrepCourse] =
    useState<boolean>(false);

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

  const CreatePrepCourse = () => {
    return openCreatePrepCourse ? (
      <ModalCreatePrepCourse
        isOpen={openCreatePrepCourse}
        handleClose={() => setOpenCreatePrepCourse(false)}
        onSuccess={(prep: PartnerPrepCourse) => {
          setOpenCreatePrepCourse(false);
          setEntities([prep, ...entities]);
        }}
      />
    ) : null;
  };

  const buttons: ButtonProps[] = [
    {
      onClick: () => {
        setOpenCreatePrepCourse(true);
      },
      typeStyle: "accepted",
      size: "small",
      children: (
        <div className="flex items-center gap-2">
          <BiPlusCircle className="w-5 h-5" /> Cadastrar Cursinho
        </div>
      ),
    },
  ];

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
        buttons,
      }}
    >
      <DashCardTemplate />
      <ShowPrepCourse />
      <CreatePrepCourse />
    </DashCardContext.Provider>
  );
}
