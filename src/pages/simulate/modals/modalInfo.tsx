import Text from "../../../components/atoms/text"
import Button from "../../../components/molecules/button"
import ModalTemplate from "../../../components/templates/modalTemplate"
import { ModalType } from "../../../types/simulado/modalType"

interface ModalInfoProps{
    modal: ModalType
}

function ModalInfo({ modal } : ModalInfoProps){
    return (
        <ModalTemplate>
            <div className="bg-white p-10 max-w-[700px] rounded">
                <Text className="text-start">{modal.title}</Text>
                <Text size="tertiary" className="text-start">{modal.subTitle}</Text>
                <div className="flex gap-4">
                    {modal.buttons.map(btn => (
                        <Button hover typeStyle={btn.type} onClick={btn.onClick}>{btn.children}</Button>
                    ))}
                </div>
            </div>
        </ModalTemplate>
    )
}

export default ModalInfo