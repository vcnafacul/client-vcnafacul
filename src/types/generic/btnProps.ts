import { ButtonProps } from "../../components/molecules/button";
import { StatusEnum } from "../../enums/generic/statusEnum";

export interface BtnProps extends ButtonProps {
    status?: StatusEnum;
    editing: boolean;
}