import { ComponentProps, forwardRef } from "react";
import { useDashCardContext } from "../../../context/dashCardContext";
import { StatusContent } from "../../../enums/content/statusContent";
import { StatusEnum } from "../../../enums/generic/statusEnum";
import { getStatusIcon } from "../../../utils/getStatusIcon";
export interface InforCardDash {
  field: string;
  value: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CardDashProps<T = any> extends ComponentProps<"div"> {
  entity: T;
}

export interface CardDash {
  id: string;
  title: string;
  status: StatusContent | StatusEnum;
  infos?: InforCardDash[];
  className?: string;
  logo?: string;
}

export const CardDashComponent = forwardRef<HTMLDivElement, CardDashProps>(
  ({ entity, ...props }: CardDashProps, ref) => {
    const { cardTransformation, onClickCard } = useDashCardContext();
    const card = cardTransformation(entity);
    return (
      <div
        ref={ref}
        onClick={() => onClickCard(card.id)}
        className={`relative w-72 truncate bg-white drop-shadow-xl shadow-xl p-2 cursor-pointer
        border border-gray-100 border-t-0
        flex flex-col rounded-md hover:-translate-y-1 duration-300 ${card.className}`}
        {...props}
      >
        <div className="flex items-center justify-center gap-4">
          {card.logo && (
            <img src={card.logo} alt={card.title} className="w-16 h-16" />
          )}
          <span className="font-bold text-center whitespace-pre-wrap my-2 overflow-x-hidden">
            {card.title}
          </span>
        </div>
        {card.infos?.map((info, index) => (
          <div key={index} className="flex gap-2">
            <div className="font-bold">{info.field}:</div>
            <div className="whitespace-pre-wrap">{info.value}</div>
          </div>
        ))}
        <div className="absolute bottom-2 right-2">
          {getStatusIcon(card.status)}
        </div>
      </div>
    );
  }
);
