/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { useInView } from "react-intersection-observer";
import Text from "../../atoms/text";
import CardDash, { CardDashInfo } from "../../molecules/cardDash";
import { useEffect } from "react";

interface DashCardTemplateProps {
    title: string;
    filterList: JSX.Element[];
    cardlist: CardDashInfo[];
    className?: string;
    onClickCard: (id: number | string) => void;
    onLoadMoreCard?: (isDown: boolean) => void;
}

function DashCardTemplate({ title, filterList, cardlist, onClickCard, onLoadMoreCard }: DashCardTemplateProps) {
    const [firstCardRef, firstCardInView] = useInView();
    const [lastCardRef, lastCardInView] = useInView();

    useEffect(() => {
        if ((firstCardInView || lastCardInView ) && onLoadMoreCard && cardlist.length > 0) {
            onLoadMoreCard(lastCardInView)
        }
    }, [firstCardInView, lastCardInView]);

    return (
        <div className="overflow-y-auto scrollbar-hide h-screen bg-zinc-100">
            <div className="w-full flex items-center flex-col mt-4">
                <Text className="self-center" size="secondary">{title}</Text>
                <div className="flex flex-wrap justify-center items-center gap-2 z-[1] bg-gray-200 rounded-2xl bg-opacity-75 p-2 mx-4 mt-14 w-10/12 md:w-fit">
                    {filterList.map((filter, index) => (
                        <div className="h-full" key={index}>{filter}</div>
                    ))}
                </div>
            </div>
            <div className="flex flex-wrap gap-4 my-4 justify-center md:justify-start md:mx-10">
                {cardlist.map((card) => 
                    <CardDash ref={ card.isLast ? lastCardRef : card.isFirst ? firstCardRef : null}
                        key={card.cardId} id={`${card.cardId}`} onClick={() => onClickCard(card.cardId)} title={card.title} infos={card.infos} status={card.status}  />)}
            </div>
        </div>
    )
}

export default DashCardTemplate