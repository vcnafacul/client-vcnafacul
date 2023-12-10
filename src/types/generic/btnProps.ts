import { ButtonProps } from "../../components/molecules/button";
import { StatusEnum } from "./statusEnum";

export interface BtnProps extends ButtonProps {
    status?: StatusEnum;
    editing: boolean;
}