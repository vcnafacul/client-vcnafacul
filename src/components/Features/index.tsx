import { useState } from "react";
import HighlightSelector from "../HighlightSelector"
import SubTitle from "../SubTitle"
import Title from "../Title"
import { features } from "./data"
import './styles.css'
import MobileDropdownDiv from "../MobileDropdownDiv";
import { ItemCard } from "../../utils/types";

function Features() {
    
    const [feature, setFeature] = useState<ItemCard>(features.feats[0]);

    const ChangeItem = (index : number) => {
        setFeature(features.feats[index])
    }
    return (
        <div className=" text-center h-[700px] overflow-hidden flex items-center flex-col">
            <Title>{features.title}</Title>
            <SubTitle>{features.subtitle}</SubTitle>
            <div className="md:grid md:grid-cols-12 md:mx-16 flex w-full m-0 flex-col items-center">
                <HighlightSelector className="flex-col justify-between"
                    items={features.feats.map(item => (item.title))}
                    changeItem={ChangeItem}
                />
                <MobileDropdownDiv
                items={features.feats.map(item => (item.title))}
                changeItem={ChangeItem} />
                <img className="object-cover object-center flex-grow-0 w-full
                max-w-[653px] md:h-auto md:text-center md:my-0
                mx-10 transition duration-500 ease-linear"
                src={feature.image as string}/>
                <p className="mt-6 text-base text-left text-grey md:mt-7 md:mx-6 md:mb-0 md:text-center md:max-w-[623px] mx-10"
                >{feature.subtitle}</p>
            </div>
        </div>
    )
}

export default Features