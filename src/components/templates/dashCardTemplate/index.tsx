import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Paginate } from "../../../utils/paginate";
import Text from "../../atoms/text";
import { CardDash, CardDashComponent } from "../../molecules/cardDash";

interface DashCardTemplateProps<T> {
    title: string;
    filterList: JSX.Element[];
    className?: string;
    onClickCard: (id: number | string) => void;
    onLoadMoreCard: (page: number) => Promise<Paginate<T>>;
    setEntities: Dispatch<SetStateAction<T[]>>;
    entities: T[];
    cardTransformation: (entity: T) => CardDash;
    limitCardPerPage?: number;
}

function DashCardTemplate<T>({ title, filterList, onClickCard, onLoadMoreCard, 
    setEntities, entities, cardTransformation, limitCardPerPage = 50}: DashCardTemplateProps<T>) {

    const [firstCardRef, firstCardInView ] = useInView()
    const [lastCardRef, lastCardInView] = useInView();
    const [botton, setBotton] = useState<boolean>(false);
    const [top, setTop] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1)
    const limitPages = 4;
    
    useEffect(() => {
        if((lastCardInView && !botton && entities.length > 0)) {
            setPage(page + 1)
            onLoadMoreCard!(page + 1).then(res => {
                if(entities.length === 4 * limitCardPerPage) {
                    setEntities([...entities.slice(limitCardPerPage), ...res.data])
                } else setEntities([...entities, ...res.data])
                setBotton(!res)
            })
            if(page + 1 > limitPages) {
                setTop(false)
            }
        }
        else if (firstCardInView && !top) {
                setPage(page - 1)
                console.log(`up`)
                if(page - limitPages === 1) setTop(true)
                onLoadMoreCard!(page - limitPages).then(res => {
                    setEntities([...res.data, ...entities.slice(3 * limitCardPerPage)])
            })
            }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firstCardInView, lastCardInView]);

    const gapBeforeLast = 2
    const indexLastCardInView = entities.length - gapBeforeLast
    return (
        <div className={`w-full flex justify-center flex-col py-4`}>
            <div className="w-full flex items-center flex-col mt-4">
                <Text className="self-center" size="secondary">{title}</Text>
                <div className="flex flex-wrap justify-center items-center gap-2 z-[1] bg-gray-200 rounded-2xl bg-opacity-75 p-2 mx-4 mt-14 w-10/12 md:w-fit">
                    {filterList.map((filter, index) => (
                        <div className="h-full" key={index}>{filter}</div>
                    ))}
                </div>
            </div>
            <div className="flex flex-wrap gap-4 my-4 justify-center md:justify-start md:mx-10 pb-10">
                {entities.map((entity, index) => {
                    let ref = null
                    if(entities.length >= limitCardPerPage) {
                        if(index === indexLastCardInView) ref = lastCardRef
                        else {
                            if((botton || (limitCardPerPage * 4 === entities.length && !top)) && index === limitCardPerPage) ref = firstCardRef
                        }
                    }
                    const cardTrans = cardTransformation(entity)
                    return (
                        <CardDashComponent 
                            ref={ref} 
                            key={cardTrans.id} 
                            id={cardTrans.id as string} 
                            onClick={() => onClickCard(cardTrans.id)} 
                            title={cardTrans.title} 
                            infos={cardTrans.infos} 
                            status={cardTrans.status}  />
                    )
                })}
            </div>
        </div>
    )
}

export default DashCardTemplate