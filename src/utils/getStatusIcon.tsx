import {ReactComponent as StatusRejected } from "../assets/icons/statusRejected.svg";
import {ReactComponent as StatusApproved } from "../assets/icons/statusApproved.svg";
import {ReactComponent as StatusPending } from "../assets/icons/statusPending.svg";
import {ReactComponent as Upload } from "../assets/icons/upload-icon.svg";
import { StatusEnum } from "../enums/generic/statusEnum";
import { CombinedEnum, StatusContent } from "../enums/content/statusContent"

export const getStatusIcon = (status: CombinedEnum) => {
    if (status == StatusEnum.Pending) return <StatusPending />;
    if (status == StatusEnum.Approved) return <StatusApproved />;
    if (status == StatusEnum.Rejected) return <StatusRejected />;
    if (status == StatusContent.Pending_Upload) return <Upload className="fill-orange w-9 h-9" />;
};

export const getStatusBool = (actived: boolean) => {
    if(actived) return StatusEnum.Approved
    return StatusEnum.Rejected;
}