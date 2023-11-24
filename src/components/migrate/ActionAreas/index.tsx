import { useState } from "react"
import Text from "../../atoms/text"
import { actionAreas } from "./data"
import Carousel from "../Carousel"
import { CardItem } from "./types"
import Selector from "../../molecules/selector"

function ActionAreas() {

    const [index, setIndex]= useState<number>(2)

    const changeItem = (index : number) => {
        setIndex(index)
    }

    const CardTopics = (cardTopics: CardItem) => cardTopics.items.map((cardItem) => {
        return (
            <div className="">
                <div key={cardItem.id} className="my-0 mx-auto overflow-hidden w-[230px] h-[230px]
                text-grey border border-grey cursor-pointer">
                    <div className="w-full flex justify-center">
                        <img className="mt-9 mb-4 max-w-[74px] h-[74px]"
                            alt="languages" src={cardItem.image as string} />
                    </div>
                    <h3 className="text-2xl text-marine text-center z-10 py-0 px-4" >{cardItem.title}</h3>
                </div>
            </div>
        );
    })

    const cardsItems = () => {
        const childrens = CardTopics(actionAreas.cardItems[index])
        return <Carousel slidesPerView={3}
            childrens={childrens}
            className="bg-white h-72 mt-6"
            pagination
            dynamicBullets
        />
    };

    return (
        <div className="bg-white">
            <div className="container mx-auto py-14 px-0 relative flex flex-col justify-start">
                <div className="md:w-full flex justify-center items-center flex-col">
                    <Text size="secondary">{actionAreas.title}</Text>
                    <Text size="tertiary">{actionAreas.subtitle}</Text>
                </div>
                <Selector tabItems={actionAreas.tabItems} changeItem={changeItem} />
                {cardsItems()}
            </div>
        </div>
    )
}

export default ActionAreas