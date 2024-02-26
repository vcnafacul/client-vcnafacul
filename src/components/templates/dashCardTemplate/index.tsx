import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Text from "../../atoms/text";
import { CardDash, CardDashInfo } from "../../molecules/cardDash";

interface DashCardTemplateProps {
    title: string;
    filterList: JSX.Element[];
    cardlist: CardDashInfo[];
    className?: string;
    onClickCard: (id: number | string) => void;
    onLoadMoreCard?: (isDown: boolean) => void;
    limitCardPerPage?: number;
}

function DashCardTemplate({ title, filterList, cardlist, onClickCard, onLoadMoreCard, limitCardPerPage = 50}: DashCardTemplateProps) {

    const [ firstCardRef, firstCardInView ] = useInView()
    const [lastCardRef, lastCardInView] = useInView();

    useEffect(() => {
        if (onLoadMoreCard && (
            (lastCardInView && cardlist.length > 0) || 
            (firstCardInView && cardlist.length === limitCardPerPage)
        )) {
            onLoadMoreCard(lastCardInView)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const gapBeforeLast = 10
    const indexLastCardInView = cardlist.length - gapBeforeLast
    return (
        <div className="w-full flex justify-center flex-col py-4 ">
            <div className="w-full flex items-center flex-col mt-4">
                <Text className="self-center" size="secondary">{title}</Text>
                <div className="flex flex-wrap justify-center items-center gap-2 z-[1] bg-gray-200 rounded-2xl bg-opacity-75 p-2 mx-4 mt-14 w-10/12 md:w-fit">
                    {filterList.map((filter, index) => (
                        <div className="h-full" key={index}>{filter}</div>
                    ))}
                </div>
            </div>
            <div className="flex flex-wrap gap-4 my-4 justify-center md:justify-start md:mx-10">

                {cardlist.map((card, index) => {
                    let ref = null
                    if(cardlist.length >= limitCardPerPage) {
                        if(index === indexLastCardInView) ref = lastCardRef
                        else {
                            if(limitCardPerPage * 4 === cardlist.length && index === (cardlist.length - limitCardPerPage)) ref = firstCardRef
                        }
                    }
                    if(ref) console.log(ref, index)
                    return (
                        <CardDash ref={ref} key={card.cardId} id={`${card.cardId}`} onClick={() => onClickCard(card.cardId)} title={card.title} infos={card.infos} status={card.status}  />
                    )
                })}
            </div>
        </div>
    )
}

export default DashCardTemplate