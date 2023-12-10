import { ComponentProps } from "react"
import { StatusEnum } from "../../../types/generic/statusEnum";
import { getStatusIcon } from "../../../utils/getStatusIcon";
export interface InforCardDash {
    field: string;
    value: string;
}

export interface CardDashInfo extends CardDash {
    cardId: number | string;
}

export interface CardDash {
    title: string;
    status: StatusEnum
    infos?: InforCardDash[]
}

export type CardDashProps = CardDash & ComponentProps<'div'>;

function CardDash({ title, status, infos = [], ...props }: CardDashProps) {

    return (
        <div className="relative w-72 min-h-40 bg-white shadow-md p-3 cursor-pointer flex flex-col rounded-md pb-8 hover:-translate-y-1 duration-300" {...props}>
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
}

export default CardDash