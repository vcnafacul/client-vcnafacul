/* eslint-disable @typescript-eslint/no-explicit-any */
import Text from "@/components/atoms/text";
import Button from "@/components/molecules/button";
import ModalTemplate from "@/components/templates/modalTemplate";
import { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemType = "ROW";

interface SubjectItem {
  id: string;
  name: string;
}

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  subjects: SubjectItem[];
  listId: string;
  updateOrder: (dto: ChangeOrderDTO) => void;
}

interface ChangeOrderDTO {
  listId: string;
  node1: string;
  node2?: string;
}

 
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
      ref={(node) => {
        ref(node);
        drop(node);
      }}
      className="even:bg-gray-200 cursor-pointer"
    >
      <td className="text-center">{row.position}</td>
      <td className="whitespace-nowrap text-sm font-medium p-2 text-center">
        {row.name}
      </td>
    </tr>
  );
};

function OrderEditSubject(props: Props) {
  const [data, setData] = useState(
    props.subjects.map((sub, index) => ({
      ...sub,
      position: index + 1,
    }))
  );

  const moveRow = (fromIndex: number, toIndex: number) => {
    const updatedData = [...data];
    const [movedRow] = updatedData.splice(fromIndex, 1);
    updatedData.splice(toIndex, 0, movedRow);

    const updatedWithPosition = updatedData.map((item, index) => ({
      ...item,
      position: index + 1,
    }));

    setData(updatedWithPosition);
  };

  const handleSave = () => {
    if (data.length > 0) {
      props.updateOrder({
        listId: props.listId,
        node1: data[0].id,
        node2: data[1]?.id,
      });
    }
  };

  return (
    <ModalTemplate
      {...props}
      className="bg-white p-4 rounded-md w-[90vw] max-w-[600px]"
    >
      <div className="w-full flex flex-col gap-4">
        <Text size="secondary">Ordem dos Conteúdos</Text>

        <DndProvider backend={HTML5Backend}>
          <div className="max-h-[40vh] overflow-y-auto scrollbar-hide rounded-md">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="sticky top-0 bg-white z-10">
                <tr>
                  <th className="p-2">Posição</th>
                  <th className="p-2">Título</th>
                </tr>
              </thead>
              <tbody>
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
          </div>
        </DndProvider>

        <div className="flex w-full justify-center gap-4 p-4 flex-wrap">
          <Button size="small" className="w-32" onClick={props.handleClose}>
            Cancelar
          </Button>
          <Button size="small" className="w-32" onClick={handleSave}>
            Salvar
          </Button>
        </div>
      </div>
    </ModalTemplate>
  );
}

export default OrderEditSubject;
