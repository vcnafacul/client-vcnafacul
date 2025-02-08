import { useEffect, useState } from "react";
import { Navigation, Pagination } from "swiper/modules";
import { useHomeContext } from "../../../context/homeContext";
import Text from "../../atoms/text";
import Carousel from "../../molecules/carousel";
import Selector from "../../molecules/selector";
import ActionAreasSkeleton from "../actionAreasSkeleton";

export interface ItemCard {
  id: number;
  title: string;
  subtitle?: string;
  image: React.FC<React.SVGProps<SVGSVGElement>> | string;
}

interface ActionAreaItem {
  Home_Action_Area_Item_id: ItemCard;
}

interface ActionArea {
  id: number;
  title: string;
  items: ActionAreaItem[];
}

interface ActionAreasProps {
  Home_Action_Area_id: ActionArea;
}

export interface ActionProps {
  title: string;
  subtitle: string;
  areas: ActionAreasProps[];
}
function Action() {
  const { actionAreas } = useHomeContext();

  const [action, setAction] = useState<ActionArea | undefined>(
    actionAreas?.areas[0].Home_Action_Area_id
  );

  const changeItem = (index: number) => {
    setAction(actionAreas!.areas[index].Home_Action_Area_id);
  };

  const CardTopics = (cardTopics: ActionArea | undefined) =>
    cardTopics?.items.map((cardItem) => {
      return (
        <div
          key={cardItem.Home_Action_Area_Item_id.id}
          className="my-0 mx-auto overflow-hidden w-[230px] h-[230px]
                text-grey border border-grey flex flex-col items-center justify-center"
        >
          <div className="flex justify-center w-28 h-28">
            {
              typeof cardItem.Home_Action_Area_Item_id.image === 'string' ? 
              <img src={cardItem.Home_Action_Area_Item_id.image as string} /> : 
              <cardItem.Home_Action_Area_Item_id.image />
            }
          </div>
          <h3 className="z-10 px-4 py-0 text-2xl text-center text-marine">
            {cardItem.Home_Action_Area_Item_id.title}
          </h3>
        </div>
      );
    });

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
  };

  const cardsItems = () => {
    const childrens = CardTopics(action);
    return (
      <Carousel
        childrens={childrens}
        className="container mx-auto mt-6 bg-white h-72"
        modules={[Pagination, Navigation]}
        pagination
        dynamicBullets
        breakpoints={breakpoints}
        centerInsufficientSlides={false}
      />
    );
  };

  useEffect(() => {
    if (actionAreas) {
      setAction(actionAreas.areas[0].Home_Action_Area_id);
    }
  }, [actionAreas]);

  if (!actionAreas) return <ActionAreasSkeleton />;
  return (
    <div className="bg-white px-2">
      <div className="container relative flex flex-col justify-start px-0 mx-auto py-14">
        <div className="flex flex-col items-center justify-center md:w-full">
          <Text size="secondary">{actionAreas!.title}</Text>
          <Text size="tertiary">{actionAreas!.subtitle}</Text>
        </div>
        <Selector
          tabItems={actionAreas!.areas.map(
            (area) => area.Home_Action_Area_id.title
          )}
          changeItem={changeItem}
          activetab={0}
        />
      </div>
      {cardsItems()}
    </div>
  );
}

export default Action;
