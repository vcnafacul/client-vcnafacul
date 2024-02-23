import { useState } from "react"
import Text from "../../components/atoms/text"
import Ul from "../../components/atoms/ul"
import CardSimulate from "../../components/molecules/cardSimulate"
import CarouselRef from "../../components/organisms/carouselRef"
import { ICard } from "../../types/simulado/ISimulateData"
import { simulateData } from "./data"
import NewSimulate from "./modals/newSimulate"
import './styles.css'
import { HIstoricosMock } from "./mock"
import { getFormatingTime } from '../../utils/getFormatingTime'
import { getStatusIcon } from "../../utils/getStatusIcon"
import { StatusEnum } from "../../enums/generic/statusEnum"

function MainSimulate() {
    const [initialize, setInitialize]= useState<boolean>(false);
    const [card, setCard] = useState<ICard>()

    const openModalNew = (card: ICard) => {
        setCard(card)
        setInitialize(true)
    }

    const cardsBook = simulateData.simulateCardsBook.map(card => {
            return (
                <CardSimulate key={card.id} onClick={() => {openModalNew(card)}} title={card.tipo} icon={card.icon} className={card.className} color={card.color}>
                    {card.subTitle}
                </CardSimulate>
            )})

    const cardsDay = simulateData.simulateCardsDay.map(card => {
        return (
            <CardSimulate key={card.id} onClick={() => {openModalNew(card)}} title={card.tipo} icon={card.icon} className={card.className} color={card.color}>
                <Ul childrens={card.item!} />
            </CardSimulate>
        )})

    const breakpointsBook = {
        1: {
            slidesPerView: 1,
            loop: false
        },
        896: {
            slidesPerView: 2,
            centeredSlides: false,
            loop: false
        },
        1120: {
            slidesPerView: 2.2,
            centeredSlides: false,
            loop: false
        },
        1344: {
            slidesPerView: 2.5,
            centeredSlides: false,
            loop: false
        },
        1568: {
            slidesPerView: 3.1,
            centeredSlides: false,
            loop: false
        },
        1800: {
            slidesPerView: 3.4,
            centeredSlides: false,
            loop: false
        },
        2277: {
            slidesPerView: 4,
            centeredSlides: false
        },
      }

    const breakpointsDay = {
        1: {
            slidesPerView: 1,
            centeredSlides: true,
            loop: false
        },
        1200: {
            slidesPerView: 1.25,
            centeredSlides: true,
            loop: false
        },
        1300: {
            slidesPerView: 1.5,
            centeredSlides: true,
            loop: false
        },
        1500: {
            slidesPerView: 2,
            centeredSlides: false,
        },
      }

    const ModalNewSimulate = () => {
        if(!initialize) return null
        return <NewSimulate title={card!.tipo} 
        handleClose={() => { setInitialize(false) }} />
    }

    return (
        <>
                <div className="relative pb-1">
                    <div className="relative sm:mx-10">
                        <div className="flex flex-col items-start pt-10 mb-20">
                            <Text size="primary" className="mb-1">{simulateData.titleBook}</Text>
                            <Text size="tertiary" className="text-xl">{simulateData.subTitleBook}</Text>
                            <CarouselRef className="w-full" childrens={cardsBook} breakpoints={breakpointsBook} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-10 gap-8">
                            <div className="flex flex-col items-start sm:col-span-1 md:col-span-3">
                                <Text size="primary">{simulateData.titleDay}</Text>
                                <Text size="tertiary" className="text-start text-xl mt-8">{simulateData.subTitleDay}</Text>
                            </div>
                            <div className="sm:col-span-2 md:col-span-7 flex justify-center">
                            <CarouselRef className="w-[448px] md:w-full" childrens={cardsDay} breakpoints={breakpointsDay} />
                            </div>
                        </div>
                        <div className="w-full pr-20 my-10">
                            <Text size="primary" className="text-start">Histórico de Simulados</Text>
                            <Text size="tertiary" className="text-start text-gray-500">Veja aqui todos os simulados que você já realizou.</Text>
                            <div className="relative">
                                <div className="w-40 h-40 bg-green3 absolute right-0 -top-20 -z-10 rotate-45" />
                                <div className="border border-green3 bg-white">
                                    {HIstoricosMock.map((item) => {
                                        return (
                                            <div className="flex flex-wrap gap-4 bg-white p-4 m-2.5 shadow-md justify-between">
                                                        <div className="flex min-w-[200px]">
                                                            <div>Caderno:  </div>
                                                            <div className="font-bold">{item.simulado.tipo.nome}</div>
                                                        </div>
                                                        <div className="flex gap-2 min-w-[120px]">
                                                            <div className="font-bold">{item.simulado.tipo.quantidadeTotalQuestao} </div>
                                                            <div>questões</div>
                                                        </div>
                                                        <div className="flex min-w-[120px]">
                                                            <div>tempo:</div>
                                                            <div className="font-bold">{getFormatingTime(item.tempoRealizado)}</div>
                                                        </div>
                                                        <div className="flex min-w-[200px]">
                                                            <div>Aproveitamento:</div>
                                                            <div className="font-bold">{(item.aproveitamento.geral * 100).toFixed(2)} %</div>
                                                        </div>
                                                        <div>{getStatusIcon(item.questoesRespondidas === item.simulado.tipo.quantidadeTotalQuestao ? StatusEnum.Approved : StatusEnum.Rejected)}</div>
                                                    </div>
                                            )
                                        })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            <ModalNewSimulate />
        </>
    )
}

export default MainSimulate