import { useState } from "react";
import Text from "../../atoms/text"
import './styles.css'
import Selector from "../../molecules/selector";
import { ItemCard } from "../actionAreas";

interface FeaturesItemsProps {
    Home_Features_Item_id: ItemCard
}

export interface FeaturesProps {
    title: string;
    subtitle: string;
    items: FeaturesItemsProps[]
}

function Features({title, subtitle, items} : FeaturesProps) {
    
    const [feature, setFeature] = useState<ItemCard>(items[0].Home_Features_Item_id);

    const changeItem = (index : number) => {
        setFeature(items[index].Home_Features_Item_id)
    }
    return (
        <div className=" text-center  overflow-hidden flex items-center flex-col">
            <Text size="secondary" className="mt-2">{title}</Text>
            <Text size="tertiary">{subtitle}</Text>
            <div className="md:grid md:grid-cols-12 md:mx-16 flex w-full m-0 flex-col items-center">
                <Selector align="vertial" changeItem={changeItem} tabItems={items.map(item => (item.Home_Features_Item_id.title))}/>
                <img className="object-cover object-center flex-grow-0 w-full max-w-[653px] md:h-auto md:text-center md:my-0 mx-10 transition duration-500 ease-linear" src={feature.image as string}/>
                <Text size="tertiary" className="text-left text-grey md:text-center md:max-w-[623px] description md:text-base md:mt-3 mx-10">{feature.subtitle}</Text>
            </div>
        </div>
    )
}

export default Features