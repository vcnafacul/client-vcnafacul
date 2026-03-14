import Text from "@/components/atoms/text";
import Button from "@/components/molecules/button";
import ModalTemplate from "@/components/templates/modalTemplate";
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

function SortableRow({ row, position }: { row: Student; position: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`even:bg-gray-200 ${isDragging ? "bg-blue-50" : ""}`}
      {...attributes}
      {...listeners}
    >
      <td className="text-center cursor-grab active:cursor-grabbing">
        {position}
      </td>
      <td className="whitespace-nowrap text-sm font-medium p-2 text-center">
        {row.name}
      </td>
    </tr>
  );
}

function WaitingListEdit(props: Props) {
  const [data, setData] = useState<Student[]>(props.students);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setData((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id);
        const newIndex = prev.findIndex((item) => item.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  return (
    <ModalTemplate {...props} className="bg-white p-4 rounded-md">
      <div className="w-full overflow-y-auto scrollbar-hide flex flex-col gap-4">
        <Text size="secondary">Lista de Espera</Text>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th>Posição</th>
                <th>Nome Completo</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <SortableContext
                items={data.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {data.map((row, index) => (
                  <SortableRow
                    key={row.id}
                    row={row}
                    position={index + 1}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>
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
