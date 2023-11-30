import { ComponentProps } from "react"
import { StatusEnum } from "../../../types/geolocation/statusEnum";

import {ReactComponent as StatusRejected } from "../../../assets/icons/statusRejected.svg";
import {ReactComponent as StatusApproved } from "../../../assets/icons/statusApproved.svg";
import {ReactComponent as StatusPending } from "../../../assets/icons/statusPending.svg";

export interface InforCardDash {
    field: string;
    value: string;
}

export type CardDashProps = ComponentProps<'div'> & {
    cardId: number;
    title: string;
    status: StatusEnum
    infos?: InforCardDash[]
}

function CardDash({ title, status, infos = [], ...props }: CardDashProps) {

    const atualizaStatus = (status: StatusEnum) => {
        if (status == StatusEnum.Pending) return <StatusPending />;
        if (status == StatusEnum.Approved) return <StatusApproved />;
        if (status == StatusEnum.Rejected) return <StatusRejected />;
    };

    return (
        <div className="relative w-72 min-h-40 bg-white shadow-md p-3 cursor-pointer flex flex-col rounded-md pb-8 hover:-translate-y-1 duration-300" {...props}>
            <span className="font-bold w-full text-center mb-2">{title}</span>
            {infos.map(info => (
                <div className="flex gap-2">
                    <div className="font-bold">{info.field}:</div>
                    <div>{info.value}</div>
                </div>
            ))}
            <div className="absolute bottom-2 right-2">
                {atualizaStatus(status)}
            </div>
        </div>
    )
}

export default CardDash