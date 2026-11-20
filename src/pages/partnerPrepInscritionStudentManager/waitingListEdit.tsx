import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
      className={`even:bg-muted ${isDragging ? "bg-info-muted" : ""}`}
      {...attributes}
      {...listeners}
    >
      <td className="text-center cursor-grab active:cursor-grabbing">
        {position}
      </td>
      <td className="sm:whitespace-nowrap break-words text-body font-medium p-2 text-center">
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
    <Dialog open={props.isOpen} onOpenChange={(o) => !o && props.handleClose()}>
      <DialogContent
        size="md"
        aria-describedby={undefined}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Lista de Espera</DialogTitle>
        </DialogHeader>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="min-w-full divide-y divide-border">
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
        <DialogFooter>
          <Button variant="outline" onClick={props.handleClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => props.updateOder(data.map((s) => s.id))}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default WaitingListEdit;
