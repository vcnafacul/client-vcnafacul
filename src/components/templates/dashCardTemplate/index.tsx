import Text from "../../atoms/text";
import CardDash, { CardDashInfo } from "../../molecules/cardDash";
import { HeaderProps } from "../../organisms/header"

interface DashCardTemplateProps {
    header: HeaderProps,
    title: string;
    filterList: JSX.Element[];
    cardlist: CardDashInfo[];
    className?: string;
    onClickCard: (id: number | string) => void;
}

function DashCardTemplate({ title, filterList, cardlist, onClickCard}: DashCardTemplateProps) {
    return (
        <div className="w-full flex justify-center flex-col py-4">
            <div className="w-full flex items-center flex-col mt-4">
                <Text size="secondary">{title}</Text>
                <div className="flex flex-wrap justify-center items-center gap-x-4 fixed z-50 bg-gray-200 rounded-2xl bg-opacity-75 top-36 left-20 pr-4">
                    {filterList.map((filter, index) => (
                        <div className="h-full" key={index}>{filter}</div>
                    ))}
                </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-20 mx-5">
                {cardlist.map(card => (
                    <CardDash onClick={() => onClickCard(card.cardId)} key={card.cardId} title={card.title} infos={card.infos} status={card.status} />
                ))}
            </div>
        </div>
    )
}

export default DashCardTemplate