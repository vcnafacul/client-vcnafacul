import type { ComponentProps } from "react";

import type { ButtonProps } from "@/components/ui/button";
import { StatusEnum } from "../../enums/generic/statusEnum";

export interface BtnProps extends ComponentProps<"button"> {
    variant?: ButtonProps["variant"];
    status?: StatusEnum;
    editing: boolean;
}
