import { useState } from "react"
import Text from "../../atoms/text"
import Selector from "../../molecules/selector"
import Carousel from "../../molecules/carousel";

export interface ItemCard {
    id: number;
    title: string;
    subtitle?: string;
    image: React.FunctionComponent<React.SVGProps<SVGSVGElement>> | string;
}

interface CardItem {
    id: number,
    items: ItemCard[]
}

export interface ActionAreasProps{
    title: string;
    subtitle: string;
    tabItems: string[];
    cardItems: CardItem[]
}

function ActionAreas({title, subtitle, tabItems, cardItems} : ActionAreasProps) {

    const [index, setIndex]= useState<number>(2)

    const changeItem = (index : number) => {
        setIndex(index)
    }

    const CardTopics = (cardTopics: CardItem) => cardTopics.items.map((cardItem) => {
        const Icon = cardItem.image;
        return (
            <div className="">
                <div key={cardItem.id} className="my-0 mx-auto overflow-hidden w-[230px] h-[230px]
                text-grey border border-grey cursor-pointer">
                    <div className="w-full flex justify-center">
                        <Icon className="mt-9 mb-4 max-w-[74px] h-[74px] fill-pink" />
                    </div>
                    <h3 className="text-2xl text-marine text-center z-10 py-0 px-4" >{cardItem.title}</h3>
                </div>
            </div>
        );
    })

    const breakpoints = {
        1: {
            slidesPerView: 1,
        },
        500: {
            slidesPerView: 2,
  
        },
        800: {
            slidesPerView: 3,
  
        },
        1100: {
            slidesPerView: 4,
  
        },
      }

    const cardsItems = () => {
        const childrens = CardTopics(cardItems[index])
        return <Carousel
            childrens={childrens}
            className="bg-white h-72 mt-6 container mx-auto"
            pagination
            dynamicBullets
            breakpoints={breakpoints}
            centeredSlides={false}
        />
    };

    return (
        <div className="bg-white">
            <div className="container mx-auto py-14 px-0 relative flex flex-col justify-start">
                <div className="md:w-full flex justify-center items-center flex-col">
                    <Text size="secondary">{title}</Text>
                    <Text size="tertiary">{subtitle}</Text>
                </div>
                <Selector tabItems={tabItems} changeItem={changeItem} />
            </div>
            {cardsItems()}
        </div>
    )
}

export default ActionAreas