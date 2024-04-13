import { useState } from "react";
import Select from "../../../components/atoms/select";
import { OptionProps } from "../../../components/atoms/selectOption";
import Text from "../../../components/atoms/text";
import Button from "../../../components/molecules/button";
import { DemandSelected } from "./viewOrder";

interface ChangeOrderProps {
  demand: DemandSelected;
  optionNumber: OptionProps[];
  updateNode: (position: number) => void;
}

function ChangeOrder({ demand, optionNumber, updateNode }: ChangeOrderProps) {
  const [position, setPosition] = useState<number | string>(
    optionNumber[0].id as number
  );
  return (
    <>
      <div className="bg-white p-4 rounded">
        <Text size="secondary">{demand.title}</Text>
        <p>Selecione a nova posição</p>
        <Select
          options={optionNumber}
          defaultValue={0}
          setState={setPosition}
        />
        <div className="flex gap-4 py-4">
          <Button onClick={() => updateNode(position as number)}>Salvar</Button>
        </div>
      </div>
    </>
  );
}

export default ChangeOrder;
