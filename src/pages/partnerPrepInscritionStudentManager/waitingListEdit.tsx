/* eslint-disable @typescript-eslint/no-explicit-any */
import Text from "@/components/atoms/text";
import Button from "@/components/molecules/button";
import ModalTemplate from "@/components/templates/modalTemplate";
import { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemType = "ROW";

interface Student {
  id: string;
  position: number;
  name: string;
}

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  inscriptionId: string;
  students: Student[];
  updateOder: (studentsId: string[]) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DraggableRow = ({ row, index, moveRow }: any) => {
  const [, ref] = useDrag({
    type: ItemType,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (draggedItem) => {
      if ((draggedItem as any).index !== index) {
        moveRow((draggedItem as any).index, index);
        (draggedItem as any).index = index;
      }
    },
  });

  return (
    <tr
      ref={(node) => ref(drop(node))}
      className="even:bg-gray-200 cursor-pointer"
    >
      <td className="text-center">{row.position}</td>
      <td className="whitespace-nowrap text-sm font-medium p-2 text-center">
        {row.name}
      </td>
    </tr>
  );
};

function WaitingListEdit(props: Props) {
  const [data, setData] = useState<Student[]>(props.students);

  const moveRow = (fromIndex: number, toIndex: number) => {
    const updatedData = [...data];
    const [movedRow] = updatedData.splice(fromIndex, 1);
    updatedData.splice(toIndex, 0, movedRow);

    // Atualiza a posição
    const updatedWithPosition = updatedData.map((item, index) => ({
      ...item,
      position: index + 1,
    }));
    setData(updatedWithPosition);
  };

  return (
    <ModalTemplate {...props} className="bg-white p-4 rounded-md">
      <div className="w-full overflow-y-auto scrollbar-hide flex flex-col gap-4">
        <Text size="secondary">Lista de Espera</Text>
        <DndProvider backend={HTML5Backend}>
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th>Posição</th>
                <th>Nome Completo</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {data.map((row, index) => (
                <DraggableRow
                  key={row.id}
                  row={row}
                  index={index}
                  moveRow={moveRow}
                />
              ))}
            </tbody>
          </table>
        </DndProvider>
        <div className="flex w-full justify-center gap-4 p-4 flex-wrap">
          <Button size="small" className="w-32" onClick={props.handleClose}>
            Cancelar
          </Button>
          <Button
            size="small"
            className="w-32"
            onClick={() => props.updateOder(data.map((s) => s.id))}
          >
            Salvar
          </Button>
        </div>
      </div>
    </ModalTemplate>
  );
}

export default WaitingListEdit;
