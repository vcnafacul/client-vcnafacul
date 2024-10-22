import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useDashCardContext } from "../../../context/dashCardContext";
import Filter from "../../atoms/filter";
import Select from "../../atoms/select";
import Text from "../../atoms/text";
import Button from "../../molecules/button";
import { CardDashComponent } from "../../molecules/cardDash";

interface Props {
  customFilter?: JSX.Element[];
  headerDash?: JSX.Element | undefined;
  backButton?: React.ReactNode;
  classNameFilter?: string;
  className?: string;
}

function DashCardTemplate({
  customFilter,
  headerDash,
  backButton,
  classNameFilter,
  className,
}: Props) {
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
    totalItems,
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
    <div className="w-full flex flex-col py-4">
      <div className="relative flex flex-col items-center w-full mt-4">
        <div className=" flex flex-col-reverse items-center gap-2 mt-4 sm:mt-0">
          <Text className="self-center" size="secondary">
            {title}
          </Text>
          {backButton}
        </div>
        <div
          className={`relative md:fixed flex flex-wrap flex-col justify-center items-center gap-2 z-[1] rounded-2xl bg-opacity-95 p-2 w-10/12 md:w-fit ${
            filterProps || buttons || totalItems ? "bg-gray-200 mt-14" : ""
          } ${classNameFilter}`}
        >
          <div
            className={`relative flex flex-wrap items-center md:justify-start justify-center gap-4 w-full mb-4 `}
          >
            {filterProps && (
              <Filter
                {...filterProps}
                keyDown={() => {
                  setPage(1);
                  filterProps.keyDown!();
                }}
              />
            )}
            <div className="flex gap-4 flex-wrap justify-center">
              {buttons?.map((button, index) => (
                <Button key={index} {...button} />
              ))}
              {customFilter?.map((filter, index) => (
                <div key={index}> {filter}</div>
              ))}
              {totalItems && (
                <span className="m-0 md:absolute left-4 top-16 font-bold text-marine text-base">
                  Total de Registros: {totalItems}
                </span>
              )}
            </div>
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
      {headerDash}
      <div
        className={`${
          className || (!filterProps && !buttons) ? "mt-0" : "md:mt-52"
        } flex flex-wrap justify-center gap-4 pb-10 my-4 md:mx-10 ${className}`}
      >
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

DashCardTemplate.BackButton = Button;

export default DashCardTemplate;
