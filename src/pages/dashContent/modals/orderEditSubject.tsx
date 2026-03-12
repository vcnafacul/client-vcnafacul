import Text from "@/components/atoms/text";
import Button from "@/components/molecules/button";
import ModalTemplate from "@/components/templates/modalTemplate";
import { ChangeOrderSubjectDTO } from "@/dtos/content/changeOrderSubject";
import { useToastAsync } from "@/hooks/useToastAsync";
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

interface SubjectItem {
  id: string;
  name: string;
}

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  subjects: SubjectItem[];
  listId: string;
  updateOrder: (dto: ChangeOrderSubjectDTO) => void;
}

function SortableRow({ row, position }: { row: SubjectItem; position: number }) {
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

function OrderEditSubject(props: Props) {
  const executeToast = useToastAsync();

  const [data, setData] = useState<SubjectItem[]>(props.subjects);

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

  const handleSave = () => {
    if (data.length === 0) return;
    const dto = {
      listId: props.listId,
      node1: data[0].id,
      node2: data[1]?.id,
    };
    executeToast({
      action: async () => {
        const result = props.updateOrder(dto) as void | Promise<unknown>;
        if (result != null && typeof (result as Promise<unknown>).then === "function") {
          await (result as Promise<unknown>);
        }
      },
      loadingMessage: "Salvando ordem...",
      successMessage: "Ordem salva com sucesso!",
      errorMessage: "Erro ao salvar a ordem. Tente novamente.",
      onSuccess: props.handleClose,
    });
  };

  return (
    <ModalTemplate
      {...props}
      className="bg-white p-4 rounded-md w-[90vw] max-w-[600px]"
    >
      <div className="w-full flex flex-col gap-4">
        <Text size="secondary">Ordem dos Conteúdos</Text>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="max-h-[40vh] overflow-y-auto scrollbar-hide rounded-md">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="sticky top-0 bg-white z-10">
                <tr>
                  <th className="p-2">Posição</th>
                  <th className="p-2">Título</th>
                </tr>
              </thead>
              <tbody>
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
          </div>
        </DndContext>

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
