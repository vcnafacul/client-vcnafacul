import { useEffect, useState } from "react";
import { useHomeContext } from "../../../context/homeContext";
import Selector from "../../molecules/selector";
import FeatureSkeleton from "../featuresSkeleton";
import "./styles.css";

interface FeatureItemCard {
  id: number;
  title: string;
  description?: string | null;
  image: React.FC<React.SVGProps<SVGSVGElement>> | string;
}

interface FeaturesItemsProps {
  Home_Features_Item_id: FeatureItemCard;
}

export interface FeaturesProps {
  title: string;
  description?: string | null;
  items: FeaturesItemsProps[];
}

function Features() {
  const { features } = useHomeContext();
  const [activeTab, setActiveTab] = useState(0);

  const changeItem = (index: number) => {
    setActiveTab(index);
  };

  useEffect(() => {
    setActiveTab(0);
  }, [features]);

  if (!features) return <FeatureSkeleton />;
  if (features.items.length === 0) return null;
  const feature: FeatureItemCard | undefined =
    features.items[activeTab]?.Home_Features_Item_id;
  return (
    <div className=" text-center  overflow-hidden flex items-center flex-col">
      <h2 className="text-h1 text-foreground mb-6 text-center mt-2">
        {features!.title}
      </h2>
      {features.description && (
        <p className="text-foreground mb-6 text-center text-prose leading-6 md:leading-9">
          {features.description}
        </p>
      )}
      <div className="md:grid md:grid-cols-12 md:mx-16 flex w-full m-0 flex-col items-center relative">
        <Selector
          align="vertial"
          changeItem={changeItem}
          tabItems={features?.items.map(
            (item) => item.Home_Features_Item_id.title
          )}
          activeTab={activeTab}
        />
        <img
          className="object-cover object-center w-full max-w-[653px] aspect-video rounded-sm
          md:text-center md:my-0 mx-10 transition duration-500 ease-linear"
          src={feature?.image as string}
        />
        {feature?.description && (
          <p className="description text-body text-muted-foreground mt-3 mx-10 md:max-w-[623px] md:text-center">
            {feature.description}
          </p>
        )}
      </div>
    </div>
  );
}

export default Features;
