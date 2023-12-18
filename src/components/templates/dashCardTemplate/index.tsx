import Text from "../../atoms/text";
import CardDash, { CardDashInfo } from "../../molecules/cardDash";

interface DashCardTemplateProps {
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
                <Text className="self-center" size="secondary">{title}</Text>
                <div className="flex flex-wrap justify-center items-center gap-2 z-[1] fixed bg-gray-300 rounded-2xl bg-opacity-75 p-2 mx-4 my-14 w-10/12 md:w-fit">
                    {filterList.map((filter, index) => (
                        <div className="h-full" key={index}>{filter}</div>
                    ))}
                </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-20 justify-center py-24 sm:py-16 md:py-8">
                {cardlist.map(card => (
                    <CardDash onClick={() => onClickCard(card.cardId)} key={card.cardId} title={card.title} infos={card.infos} status={card.status} />
                ))}
            </div>
        </div>
    )
}

export default DashCardTemplate