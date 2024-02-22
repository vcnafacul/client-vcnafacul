import Text from "../../components/atoms/text"
import Ul from "../../components/atoms/ul"
import CardSimulate from "../../components/molecules/cardSimulate"
import { simulateData } from "./data"
import './styles.css'
import CarouselRef from "../../components/organisms/carouselRef"
import NewSimulate from "./modals/newSimulate"
import { useState } from "react"
import { ICard } from "../../types/simulado/ISimulateData"
import './styles.css'
import { HIstoricosMock } from "./mock"

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
                <div className="relative">
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
                        <div className="flex flex-col items-start pt-10 mb-20">
                            <Text size="primary">Histórico de Simulados</Text>
                            <Text size="tertiary" className="text-xl">Veja aqui todos os simulados que você já realizou.</Text>
                            <div>
                                {HIstoricosMock.map((historico ) => {
                                    return (
                                        <div className="flex items-start space-x-14 ">
                                            <Text size="secondary">{historico.simulado.tipo.nome}</Text>
                                            <Text size="tertiary">{historico.simulado.tipo.quantidadeTotalQuestao}</Text>
                                            <Text size="tertiary">{historico.simulado.tipo.duracao}</Text>
                                            <Text size="tertiary">{historico.aproveitamento.geral}</Text>
                                        </div>
                                    )
                                
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            <ModalNewSimulate />
        </>
    )
}

export default MainSimulate