import {ReactComponent as StatusRejected } from "../assets/icons/statusRejected.svg";
import {ReactComponent as StatusApproved } from "../assets/icons/statusApproved.svg";
import {ReactComponent as StatusPending } from "../assets/icons/statusPending.svg";
import { StatusEnum } from "../types/generic/statusEnum";

export const getStatusIcon = (status: StatusEnum) => {
    if (status == StatusEnum.Pending) return <StatusPending />;
    if (status == StatusEnum.Approved) return <StatusApproved />;
    if (status == StatusEnum.Rejected) return <StatusRejected />;
};