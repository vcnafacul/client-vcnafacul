import React from "react";
import Text from "../../atoms/text";
import Button from "../../molecules/button";
import ModalTemplate from "../../templates/modalTemplate"

export interface ModalConfirmCancelProps{
    handleConfirm: (string?: string) => void;
    handleCancel: () => void;
    confirmDisabled?: boolean;
    text: string;
    children?: React.ReactNode;
}

function ModalConfirmCancel({ handleConfirm, handleCancel, confirmDisabled, text, children } : ModalConfirmCancelProps){
    return (
        <ModalTemplate>
            <div className="bg-lightGray border-2 border-marine p-8 md:max-w-[600px] rounded-2xl">
            <Text size="tertiary" className="font-black">{text}</Text>
            {children}
            <div className="flex gap-2">
                <Button disabled={confirmDisabled ?? false} size="small" typeStyle="quaternary" hover onClick={() => { handleConfirm() }}>Confirmar</Button>
                <Button size="small" typeStyle="quaternary" hover onClick={handleCancel}>Cancelar</Button>
            </div>
            </div>
        </ModalTemplate>
    )
}

export default ModalConfirmCancel