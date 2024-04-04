import { ComponentProps, forwardRef } from "react"
import { getStatusIcon } from "../../../utils/getStatusIcon";
import { StatusContent } from "../../../enums/content/statusContent";
import { StatusEnum } from "../../../enums/generic/statusEnum";
export interface InforCardDash {
    field: string;
    value: string;
}

export interface CardDashInfo extends CardDash {
    cardId: number | string;
}

export interface CardDash {
    id: string | number;
    title: string;
    status: StatusContent | StatusEnum;
    infos?: InforCardDash[];
}

export type CardDashProps = CardDash & ComponentProps<'div'>;

export const CardDashComponent = forwardRef<HTMLDivElement, CardDashProps >(({ title, status, infos = [], ...props } : CardDashProps, ref ) => {
    return (
        <div ref={ref} className="relative w-72 min-h-40 truncate bg-white drop-shadow-xl shadow-xl p-2 cursor-pointer flex flex-col rounded-md pb-8 hover:-translate-y-1 duration-300" {...props}>
            <span className="font-bold w-full text-center mb-2">{title}</span>
            {infos.map((info, index) => (
                <div key={index} className="flex gap-2">
                    <div className="font-bold">{info.field}:</div>
                    <div>{info.value}</div>
                </div>
            ))}
            <div className="absolute bottom-2 right-2">
                {getStatusIcon(status)}
            </div>
        </div>
    )
})