import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useDashCardContext } from "../../../context/dashCardContext";
import Filter from "../../atoms/filter";
import Select from "../../atoms/select";
import Text from "../../atoms/text";
import Button from "../../molecules/button";
import { CardDashComponent } from "../../molecules/cardDash";

interface Props {
  customFilter?: JSX.Element[];
}

function DashCardTemplate({ customFilter }: Props) {
  const [firstCardRef, firstCardInView] = useInView();
  const [lastCardRef, lastCardInView] = useInView();
  const [botton, setBotton] = useState<boolean>(false);
  const [top, setTop] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const limitPages = 4;

  const {
    title,
    entities,
    setEntities,
    limitCards,
    getMoreCards,
    filterProps,
    selectFiltes,
    buttons,
  } = useDashCardContext();

  useEffect(() => {
    if (lastCardInView && !botton && entities.length > 0) {
      setPage(page + 1);
      getMoreCards!(page + 1).then((res) => {
        if (entities.length === 4 * limitCards) {
          setEntities([...entities.slice(limitCards), ...res.data]);
        } else setEntities([...entities, ...res.data]);
        setBotton(!res);
      });
      if (page + 1 > limitPages) {
        setTop(false);
      }
    } else if (firstCardInView && !top) {
      setPage(page - 1);
      if (page - limitPages === 1) setTop(true);
      getMoreCards!(page - limitPages).then((res) => {
        setEntities([...res.data, ...entities.slice(0, 3 * limitCards)]);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstCardInView, lastCardInView]);

  const gapBeforeLast = Math.floor(limitCards * 0.25);
  const indexLastCardInView = entities.length - gapBeforeLast;

  return (
    <div className={`w-full flex justify-center flex-col py-4`}>
      <div className="flex flex-col items-center w-full mt-4">
        <Text className="self-center" size="secondary">
          {title}
        </Text>
        <div className="flex flex-wrap flex-col justify-center items-center gap-2 z-[1] bg-gray-200 rounded-2xl bg-opacity-75 p-2 mt-14 w-10/12 md:w-fit relative">
          <div className="flex flex-wrap items-center md:justify-start justify-center gap-4 w-full mb-4">
            {filterProps && (
              <Filter
                {...filterProps}
                keyDown={() => {
                  setPage(1);
                  filterProps.keyDown!();
                }}
              />
            )}
            {buttons?.map((button, index) => (
              <Button key={index} {...button} />
            ))}
            {customFilter?.map((filter, index) => (
              <div key={index}> {filter}</div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {selectFiltes?.map((select, index) => {
              return (
                <Select
                  className="h-full"
                  key={index}
                  {...select}
                  setState={(value) => {
                    setPage(1);
                    select.setState(value);
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-4 pb-10 my-4 md:justify-start md:mx-10">
        {entities.map((entity, index) => {
          let ref = null;
          if (entities.length >= limitCards) {
            if (index === indexLastCardInView) ref = lastCardRef;
            else {
              if (
                (botton || (limitCards * 4 === entities.length && !top)) &&
                index === limitCards
              )
                ref = firstCardRef;
            }
          }
          return <CardDashComponent ref={ref} key={index} entity={entity} />;
        })}
      </div>
    </div>
  );
}

export default DashCardTemplate;
