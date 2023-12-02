import Text from "../../components/atoms/text"
import Ul from "../../components/atoms/ul"
import CardSimulate from "../../components/molecules/cardSimulate"
import DashTemplate from "../../components/templates/dashTemplate"
import { headerDash } from "../dash/data"
import { simulateData } from "./data"
import './styles.css'

import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import CarouselRef from "../../components/organisms/carouselRef"

function DashSimulate() {
    const cardsBook = simulateData.simulateCardsBook.map(card => {
            return (
                <CardSimulate onClick={() => {}} title={card.title} icon={card.icon} className={card.className} color={card.color}>
                    {card.subTitle}
                </CardSimulate>
            )})

    const cardsDay = simulateData.simulateCardsDay.map(card => {
        return (
            <CardSimulate key={card.id} onClick={() => {}} title={card.title} icon={card.icon} className={card.className} color={card.color}>
                <Ul childrens={card.item} />
            </CardSimulate>
        )})

    const breakpointsBook = {
        1: {
            slidesPerView: 1
        },
        896: {
            slidesPerView: 2,
            centeredSlides: false
        },
        1120: {
            slidesPerView: 2.2,
            centeredSlides: false
        },
        1344: {
            slidesPerView: 2.5,
            centeredSlides: false
        },
        1568: {
            slidesPerView: 3.1,
            centeredSlides: false
        },
        1800: {
            slidesPerView: 3.4,
            centeredSlides: false
        },
        2277: {
            slidesPerView: 4,
            centeredSlides: false
        },
      }

    const breakpointsDay = {
        1: {
            slidesPerView: 1,
            centeredSlides: true
        },
        1455: {
            slidesPerView: 2,
            centeredSlides: false
        },
      }

    return (
        <DashTemplate header={headerDash} hasMenu>
            <div className="relative">
                <TriangleGreen className="absolute w-40 h-40 rotate-180 -top-36 left-96"/>
                <div className="relative sm:mx-10">
                    <div className="flex flex-col items-start mt-20 mb-20">
                        <Text size="primary" className="mb-1">{simulateData.titleBook}</Text>
                        <Text size="tertiary" className="text-xl">{simulateData.subTitleBook}</Text>
                        <CarouselRef className="w-full"  childrens={cardsBook} breakpoints={breakpointsBook} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-10 gap-8">
                        <div className="flex flex-col items-start sm:col-span-1 md:col-span-3">
                            <Text size="primary">{simulateData.titleDay}</Text>
                            <Text size="tertiary" className="text-start text-xl mt-8">{simulateData.subTitleDay}</Text>
                        </div>
                        <div className="sm:col-span-2 md:col-span-7 flex justify-center">
                        <CarouselRef className="w-[448px] md:w-full " childrens={cardsDay} breakpoints={breakpointsDay} />
                        </div>
                    </div>
                </div>
            </div>
        </DashTemplate>
    )
}

export default DashSimulate