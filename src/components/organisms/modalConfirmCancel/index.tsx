import React from "react";
import Text from "../../atoms/text";
import Button from "../../molecules/button";
import ModalTemplate, { ModalProps } from "../../templates/modalTemplate";

export interface ModalConfirmCancelProps extends ModalProps{
    handleConfirm: (string?: string) => void;
    confirmDisabled?: boolean;
    text?: string;
    children?: React.ReactNode;
    isOpen: boolean;
}

function ModalConfirmCancel({ handleConfirm, confirmDisabled, text, children, handleClose, isOpen } : ModalConfirmCancelProps){
    return (
        <ModalTemplate isOpen={isOpen} handleClose={handleClose!}>
            <div className="px-4 md:max-w-[600px] rounded-2xl">
            <Text size="tertiary" className="font-black">{text}</Text>
            {children}
            <div className="flex gap-2">
                <Button disabled={confirmDisabled ?? false} size="small" typeStyle="quaternary" hover onClick={() => { handleClose!() }}>Cancel</Button>
                <Button disabled={confirmDisabled ?? false} size="small" typeStyle="quaternary" hover onClick={() => { handleConfirm() }}>Confirmar</Button>
            </div>
            </div>
        </ModalTemplate>
    )
}

export default ModalConfirmCancel