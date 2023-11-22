import { useState } from "react"
import HighlightSelector from "../HighlightSelector"
import MobileDropdownDiv from "../MobileDropdownDiv"
import SubTitle from "../SubTitle"
import Title from "../Title"
import { actionAreas } from "./data"
import Carousel from "../Carousel"
import { CardItem } from "./types"

function ActionAreas() {

    const [index, setIndex]= useState<number>(2)

    const changeItem = (index : number) => {
        setIndex(index)
    }

    const CardTopics = (cardTopics: CardItem) => cardTopics.items.map((cardItem) => {
        return (
            <div key={cardItem.id} className="my-0 mx-auto overflow-hidden max-w-[230px] min-h-[220px]
             text-grey border border-grey cursor-pointer w-96">
                <div className="w-full flex justify-center">
                    <img className="mt-9 mb-4 max-w-[74px] h-[74px]"
                        alt="languages" src={cardItem.image as string} />
                </div>
                <h3 className="text-2xl text-marine text-center z-10 py-0 px-4"
                >{cardItem.title}</h3>
                <h4>{cardItem.subtitle}</h4>
            </div>
        );
    })

    const cardsItems = () => {
        const childrens = CardTopics(actionAreas.cardItems[index])
        return <Carousel slidesPerView={3}
            childrens={childrens}
            className="bg-white h-[230px]"
        />
    };

    return (
        <div className="container mx-auto py-14 px-0 relative">
            <div className="flex flex-col ">
                <div className="md:w-full flex justify-center items-center flex-col">
                    <Title>{actionAreas.title}</Title>
                    <SubTitle>{actionAreas.subtitle}</SubTitle>
                </div>
                <HighlightSelector className="md:w-full flex justify-center" items={actionAreas.tabItems} fontSize="text-base" 
                    changeItem={changeItem} justifyContent="justify-center" liMargin="m-0" />
                <MobileDropdownDiv className="actionAreasMobileDropdown" 
                    items={actionAreas.tabItems} changeItem={changeItem} />
                {cardsItems()}
            </div>
        </div>
    )
}

export default ActionAreas