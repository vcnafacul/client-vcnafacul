/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import ModalConfirmCancel, { ModalConfirmCancelProps } from "../modalConfirmCancel";

function ModalConfirmCancelMessage({ handleConfirm, handleCancel, text} : ModalConfirmCancelProps) {
    const [message, setMessage] = useState<string>("");
    return (    
        <ModalConfirmCancel handleConfirm={() => { handleConfirm(message) }} handleCancel={handleCancel} text={text} confirmDisabled={!message}>
            <textarea onChange={(event: any) => { setMessage(event.target.value) }} className="p-2 w-full mb-4 border border-marine border-opacity-50 h-full min-h-[100px]" />
        </ModalConfirmCancel>
    )
}

export default ModalConfirmCancelMessage