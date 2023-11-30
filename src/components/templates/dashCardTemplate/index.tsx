import Text from "../../atoms/text";
import CardDash, { CardDashProps } from "../../molecules/cardDash";
import { DashCardMenu } from "../../molecules/dashCard";
import { HeaderProps } from "../../organisms/header"
import DashTemplate from "../dashTemplate"

interface DashCardTemplateProps {
    header: HeaderProps,
    dashCardList?: DashCardMenu[]
    title: string;
    filterList: JSX.Element[]
    cardlist: CardDashProps[]
}

function DashCardTemplate({ header, dashCardList, title, filterList, cardlist}: DashCardTemplateProps) {
    return (
        <DashTemplate header={header} dashCardList={dashCardList}>
            <div className="w-full flex justify-center flex-col py-4">
                <div className="w-full flex items-center flex-col mt-4">
                    <Text size="secondary">{title}</Text>
                    <div className="w-full flex justify-center gap-20">
                        {filterList.map((filter, index) => (
                            <div key={index}>{filter}</div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-20 mx-5">
                    {cardlist.map((card, index) => (
                        <CardDash key={index} title={card.title} infos={card.infos} status={card.status} />
                    ))}
                </div>
            </div>
        </DashTemplate>
    )
}

export default DashCardTemplate