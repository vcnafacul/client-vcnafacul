import { useState } from "react";
import Select from "../../../components/atoms/select"
import Text from "../../../components/atoms/text";
import Button from "../../../components/molecules/button"
import ModalTemplate, { ModalProps } from "../../../components/templates/modalTemplate"
import { DemandSelected } from "./viewOrder"
import { OptionProps } from "../../../components/atoms/selectOption";

interface ChangeOrderProps extends ModalProps{
    demand: DemandSelected;
    optionNumber: OptionProps[]
    updateNode: (position: number) => void;
}

function ChangeOrder({ handleClose, demand, optionNumber, updateNode }: ChangeOrderProps){
    const [position, setPosition] = useState<number | string>(optionNumber[0].id as number)
    return (
        <ModalTemplate>
            <div className="bg-white p-4 rounded">
                <Text size="secondary">{demand.title}</Text>
                <p>Selecione a nova posição</p>
                <Select  options={optionNumber}  defaultValue={0}  setState={setPosition} />
                <div className="flex gap-4 py-4">
                <Button onClick={() => updateNode(position as number)}>Salvar</Button>
                <Button onClick={handleClose}>Fechar</Button>
                </div>
            </div>
        </ModalTemplate>
    )
}

export default ChangeOrder