import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useDashCardContext } from "../../../context/dashCardContext";
import Filter from "../../atoms/filter";
import Select from "../../atoms/select";
import Text from "../../atoms/text";
import Button from "../../molecules/button";
import { CardDashComponent } from "../../molecules/cardDash";

interface Props {
    customFilter?: JSX.Element[]
}

function DashCardTemplate({ customFilter } : Props ) {
    const [firstCardRef, firstCardInView ] = useInView()
    const [lastCardRef, lastCardInView] = useInView();
    const [botton, setBotton] = useState<boolean>(false);
    const [top, setTop] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const limitPages = 4;
    
    const { title, entities, setEntities, limitCards, getMoreCards, filterProps, selectFiltes, buttons } = useDashCardContext()
    
    useEffect(() => {
        if((lastCardInView && !botton && entities.length > 0)) {
            setPage(page + 1)
            getMoreCards!(page + 1).then(res => {
                if(entities.length === 4 * limitCards) {
                    setEntities([...entities.slice(limitCards), ...res.data])
                } else setEntities([...entities, ...res.data])
                setBotton(!res)
            })
            if(page + 1 > limitPages) {
                setTop(false)
            }
        }
        else if (firstCardInView && !top) {
                setPage(page - 1)
                if(page - limitPages === 1) setTop(true)
                getMoreCards!(page - limitPages).then(res => {
                    setEntities([...res.data, ...entities.slice(0, 3 * limitCards)])
            })
            }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firstCardInView, lastCardInView]);

    const gapBeforeLast = Math.floor(limitCards * 0.25)
    const indexLastCardInView = entities.length - gapBeforeLast

    return (
        <div className={`w-full flex justify-center flex-col py-4`}>
            <div className="w-full flex items-center flex-col mt-4">
                <Text className="self-center" size="secondary">{title}</Text>
                <div className="flex flex-wrap flex-col justify-center items-center gap-2 z-[1] bg-gray-200 rounded-2xl bg-opacity-75 p-2 mx-4 mt-14 w-10/12 md:w-fit">
                    <div className="flex">
                        {filterProps && <Filter {...filterProps} keyDown={() => { setPage(1); filterProps.keyDown!() }} />}
                        {buttons?.map((button, index) => <Button key={index} {...button} />)}
                    </div>
                    <div className="flex gap-4 flex-wrap justify-center">
                        {selectFiltes?.map((select, index) => {
                            return <Select className="h-full" key={index} {...select}
                            setState={(value) => { setPage(1); select.setState(value)}} />
                        })}
                    </div>
                    {customFilter?.map((filter, index) => <div key={index}> { filter }</div>)}
                </div>
            </div>
            <div className="flex flex-wrap gap-4 my-4 justify-center md:justify-start md:mx-10 pb-10">
                {entities.map((entity, index) => {
                    let ref = null
                    if(entities.length >= limitCards) {
                        if(index === indexLastCardInView) ref = lastCardRef
                        else {
                            if((botton || (limitCards * 4 === entities.length && !top)) && index === limitCards) ref = firstCardRef
                        }
                    }
                    return <CardDashComponent ref={ref} key={index} entity={entity} />
                })}
            </div>
        </div>
    )
}

export default DashCardTemplate