export interface ModalType {
    show: boolean;
    title: string;
    subTitle: string;
    buttons: ButtonModal[]
}

interface ButtonModal {
    onClick: () => void;
    type?: "primary" | "secondary" | "tertiary" | "quaternary" | "none";
    children: React.ReactNode;
}