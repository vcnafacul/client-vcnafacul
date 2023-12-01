import Text from "../../atoms/text";
import Button from "../../molecules/button";
import ModalTemplate from "../../templates/modalTemplate"

interface ModalConfirmCancelProps{
    handleConfirm: () => void;
    handleCancel: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleMessagerefused: (event: any) => void;
    message: string;
}

function ModalConfirmCancel({ handleConfirm, handleCancel, message, handleMessagerefused } : ModalConfirmCancelProps){
    return (
        <ModalTemplate>
            <div className="bg-lightGray border p-4">
            <Text size="quaternary" className="font-black">{message}</Text>
            <textarea onChange={handleMessagerefused} className="p-2 w-full mb-4 border border-marine border-opacity-50 h-full min-h-[100px]" />
            <div className="flex gap-2">
                <Button size="small" typeStyle="quaternary" hover onClick={handleConfirm}>Confirmar</Button>
                <Button size="small" typeStyle="quaternary" hover onClick={handleCancel}>Cancelar</Button>
            </div>
            </div>
        </ModalTemplate>
    )
}

export default ModalConfirmCancel