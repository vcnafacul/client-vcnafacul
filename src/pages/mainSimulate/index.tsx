import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Text from "../../components/atoms/text";
import Ul from "../../components/atoms/ul";
import CardSimulate from "../../components/molecules/cardSimulate";
import CarouselRef from "../../components/organisms/carouselRef";
import SimulationHistory from "../../components/organisms/simulationHistory";
import ModalTemplate from "../../components/templates/modalTemplate";
import { HistoricoDTO } from "../../dtos/historico/historicoDTO";
import { getAllHistoricoSimulado } from "../../services/historico/getAllHistoricoSimulado";
import { useAuthStore } from "../../store/auth";
import { ICard } from "../../types/simulado/ISimulateData";
import { breakpointsBook, breakpointsDay, simulateData } from "./data";
import NewSimulate from "./modals/newSimulate";
import "./styles.css";

function MainSimulate() {
  const [initialize, setInitialize] = useState<boolean>(false);
  const [card, setCard] = useState<ICard>();
  const [historical, setHistorical] = useState<HistoricoDTO[]>([]);

  const {
    data: { token },
  } = useAuthStore();

  const openModalNew = (card: ICard) => {
    setCard(card);
    setInitialize(true);
  };

  const cardsBook = simulateData.simulateCardsBook.map((card) => {
    return (
      <CardSimulate
        key={card.id}
        onClick={() => {
          openModalNew(card);
        }}
        title={card.tipo}
        icon={card.icon}
        className={card.className}
        color={card.color}
      >
        {card.subTitle}
      </CardSimulate>
    );
  });

  const cardsDay = simulateData.simulateCardsDay.map((card) => {
    return (
      <CardSimulate
        key={card.id}
        onClick={() => {
          openModalNew(card);
        }}
        title={card.tipo}
        icon={card.icon}
        className={card.className}
        color={card.color}
      >
        <Ul childrens={card.item!} />
      </CardSimulate>
    );
  });

  const ModalNewSimulate = () => {
    return (
      <ModalTemplate
        isOpen={initialize}
        handleClose={() => {
          setInitialize(false);
        }}
      >
        <NewSimulate title={card?.tipo || ""} />
      </ModalTemplate>
    );
  };

  useEffect(() => {
    getAllHistoricoSimulado(token)
      .then((res) => {
        setHistorical(res);
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  }, []);

  return (
    <>
      <div className="relative pb-1">
        <div className="relative sm:mx-10">
          <div className="flex flex-col items-start pt-10 mb-20">
            <Text size="primary" className="mb-1">
              {simulateData.titleBook}
            </Text>
            <Text size="tertiary" className="text-xl">
              {simulateData.subTitleBook}
            </Text>
            <CarouselRef
              className="w-full"
              childrens={cardsBook}
              breakpoints={breakpointsBook}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-10 gap-8">
            <div className="flex flex-col items-start sm:col-span-1 md:col-span-3">
              <Text size="primary">{simulateData.titleDay}</Text>
              <Text size="tertiary" className="text-start text-xl mt-8">
                {simulateData.subTitleDay}
              </Text>
            </div>
            <div className="sm:col-span-2 md:col-span-7 flex justify-center">
              <CarouselRef
                className="w-[448px] md:w-full"
                childrens={cardsDay}
                breakpoints={breakpointsDay}
              />
            </div>
          </div>
          <SimulationHistory historical={historical} />
        </div>
      </div>
      <ModalNewSimulate />
    </>
  );
}

export default MainSimulate;
