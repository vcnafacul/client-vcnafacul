import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useDashCardContext } from "../../../context/dashCardContext";
import Filter from "../../atoms/filter";
import Select from "../../atoms/select";
import Button from "../../molecules/button";
import { CardDashComponent } from "../../molecules/cardDash";

interface Props {
  customFilter?: JSX.Element[];
  headerDash?: JSX.Element;
  backButton?: React.ReactNode;
  classNameFilter?: string;
  className?: string;
}

function DashCardTemplate({
  customFilter,
  headerDash,
  backButton,
  classNameFilter = "",
  className = "",
}: Props) {
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

  const [page, setPage] = useState(1);
  const [bottomReached, setBottomReached] = useState(false);
  const [firstCardRef, firstCardInView] = useInView();
  const [lastCardRef, lastCardInView] = useInView();

  const limitPages = 4;

  useEffect(() => {
    if (lastCardInView && !bottomReached && entities.length > 0) {
      const nextPage = page + 1;
      setPage(nextPage);
      getMoreCards?.(nextPage).then((res) => {
        const newItems = res?.data ?? [];

        if (entities.length === 4 * limitCards) {
          setEntities([...entities.slice(limitCards), ...newItems]);
        } else {
          setEntities([...entities, ...newItems]);
        }

        if (newItems.length < limitCards) {
          setBottomReached(true);
        }
      });
    }

    if (firstCardInView && page > limitPages) {
      const previousPage = page - 1;
      setPage(previousPage);
      getMoreCards?.(previousPage - limitPages).then((res) => {
        const newItems = res?.data ?? [];
        setEntities([...newItems, ...entities.slice(0, 3 * limitCards)]);
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstCardInView, lastCardInView]);

  return (
    <div className="w-full flex flex-col items-center py-8 bg-stone-100 min-h-[calc(100vh-76px)]">
      {/* Title + Voltar */}
      <div className="w-full max-w-7xl px-4 flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          {backButton}
          <h1 className="text-3xl font-black text-marine">{title}</h1>
        </div>
        {totalItems !== undefined && (
          <span className="text-sm text-gray-600 font-medium">
            Total de registros: {totalItems}
          </span>
        )}
      </div>

      {/* Filtros e controles */}
      <div
        className={`rounded-xl w-full max-w-7xl flex flex-col gap-4 ${classNameFilter}`}
      >
        <div>
          {filterProps && (
            <Filter
              {...filterProps}
              keyDown={() => {
                setPage(1);
                setBottomReached(false); // resetar fim da lista ao aplicar novo filtro
                filterProps.keyDown?.();
              }}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 px-4">
          <div className="flex flex-wrap gap-3">
            {buttons?.map((button, index) => (
              <Button key={index} {...button} />
            ))}
            {customFilter?.map((filter, index) => (
              <div key={index}>{filter}</div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {selectFiltes?.map((select, index) => (
              <Select
                key={index}
                {...select}
                className="min-w-[140px]"
                setState={(value) => {
                  setPage(1);
                  setBottomReached(false); // resetar ao aplicar novo select
                  select.setState(value);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Header customizado */}
      {headerDash && (
        <div className="w-full max-w-7xl mt-6 px-4">{headerDash}</div>
      )}

      {/* Cards */}
      <div
        className={`flex flex-wrap gap-6 justify-start w-full max-w-7xl mt-10 px-4 ${className}`}
      >
        {entities.map((entity, index) => {
          const isLastCard =
            index === entities.length - Math.floor(limitCards * 0.25);
          const isFirstCard =
            index === limitCards && entities.length >= limitCards * 4;
          const ref = isLastCard
            ? lastCardRef
            : isFirstCard
            ? firstCardRef
            : undefined;

          return <CardDashComponent key={index} ref={ref} entity={entity} />;
        })}
      </div>
    </div>
  );
}

DashCardTemplate.BackButton = Button;

export default DashCardTemplate;
