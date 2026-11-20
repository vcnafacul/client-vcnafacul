import type { ButtonProps } from "@/components/ui/button";

export interface ModalType {
    show: boolean;
    title: string;
    subTitle: string;
    buttons: ButtonModal[]
}

interface ButtonModal {
    onClick: () => void;
    variant?: ButtonProps["variant"];
    children: React.ReactNode;
}