import { useEffect, useState } from "react";
import { Navigation, Pagination } from 'swiper/modules';
import { useHomeContext } from "../../../context/homeContext";
import Text from "../../atoms/text";
import Carousel from "../../molecules/carousel";
import Selector from "../../molecules/selector";
import ActionAreasSkeleton from "../actionAreasSkeleton";

export interface ItemCard {
    id: number;
    title: string;
    subtitle?: string;
    image: string;
}

interface ActionAreaItem {
    Home_Action_Area_Item_id: ItemCard
}

interface ActionArea {
    id: number;
    title: string;
    Items: ActionAreaItem[];
}

interface ActionAreasProps {
    Home_Action_Area_id: ActionArea
}

export interface ActionProps{
    title: string;
    subtitle: string;
    areas: ActionAreasProps[]
}
function Action() {

    const { actionAreas } = useHomeContext()

    const [action, setAction]= useState<ActionArea | undefined>(actionAreas?.areas[0].Home_Action_Area_id)

    const changeItem = (index : number) => {
        setAction(actionAreas!.areas[index].Home_Action_Area_id)
    }

    const CardTopics = (cardTopics: ActionArea | undefined) => cardTopics?.Items.map((cardItem) => {

        return (
            <div key={cardItem.Home_Action_Area_Item_id.id} className="my-0 mx-auto overflow-hidden w-[230px] h-[230px]
                text-grey border border-grey flex flex-col items-center justify-center">
                <div className="flex justify-center w-28 h-28">
                    <img src={cardItem.Home_Action_Area_Item_id.image} />
                </div>
                <h3 className="text-2xl text-marine text-center z-10 py-0 px-4" >{cardItem.Home_Action_Area_Item_id.title}</h3>
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
        const childrens = CardTopics(action)
        return <Carousel
            childrens={childrens}
            className="bg-white h-72 mt-6 container mx-auto"
            modules={[Pagination, Navigation]}
            pagination
            dynamicBullets
            breakpoints={breakpoints}
            centerInsufficientSlides={false}
        />
    };

    useEffect(() => {
        if(actionAreas) {
            setAction(actionAreas.areas[0].Home_Action_Area_id)
        }
    }, [actionAreas])

    if(!actionAreas) return <ActionAreasSkeleton />
    return (
        <div className="bg-white">
            <div className="container mx-auto py-14 px-0 relative flex flex-col justify-start">
                <div className="md:w-full flex justify-center items-center flex-col">
                    <Text size="secondary">{actionAreas!.title}</Text>
                    <Text size="tertiary">{actionAreas!.subtitle}</Text>
                </div>
                <Selector tabItems={actionAreas!.areas.map(area => area.Home_Action_Area_id.title)} changeItem={changeItem} />
            </div>
            {cardsItems()}
        </div>
    )
}

export default Action