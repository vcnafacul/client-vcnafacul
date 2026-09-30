import Text from "@/components/atoms/text";
import Button from "@/components/molecules/button";
import ModalTemplate from "@/components/templates/modalTemplate";
import { ChangeOrderDTO } from "@/dtos/content/changeOrder";
import { StatusContent } from "@/enums/content/statusContent";
import { StatusEnum } from "@/enums/generic/statusEnum";
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

interface ContentItem {
  id: string;
  title: string;
  status: StatusContent | StatusEnum;
}

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  contents: ContentItem[];
  updateOrder: (dto: ChangeOrderDTO) => void;
  /** Depois de salvar: quem abriu atualiza a ordem, senão reabrir mostrava a antiga. */
  aoSalvar?: (ordenados: ContentItem[]) => void;
}

function statusToString(status: StatusContent | StatusEnum): string {
  if (status === StatusContent.Pending_Upload) {
    return "Pendente Upload";
  }
  if (status === StatusEnum.Approved) {
    return "Aprovado";
  }
  if (status === StatusEnum.Rejected) {
    return "Reprovado";
  }
  if (status === StatusEnum.Pending) {
    return "Pendente";
  }
  return "Status Desconhecido";
}

function SortableRow({
  row,
  position,
  onSubir,
  onDescer,
}: {
  row: ContentItem;
  position: number;
  onSubir?: () => void;
  onDescer?: () => void;
}) {
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
      <td className="break-words text-sm font-medium p-2 text-center">
        {row.title}
      </td>
      <td className="text-sm font-medium p-2 text-center">
        {statusToString(row.status)}
      </td>
      {/*
        ↑/↓: arrastar a linha não funciona no toque (a rolagem da lista ganha).
        `onPointerDown` parado para o clique não virar início de arraste.
      */}
      <td className="p-1 whitespace-nowrap text-center">
        <button
          type="button"
          aria-label="Mover para cima"
          disabled={!onSubir}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onSubir}
          className="h-9 w-9 disabled:opacity-30"
        >
          ↑
        </button>
        <button
          type="button"
          aria-label="Mover para baixo"
          disabled={!onDescer}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onDescer}
          className="h-9 w-9 disabled:opacity-30"
        >
          ↓
        </button>
      </td>
    </tr>
  );
}

function OrderEditContent(props: Props) {
  const executeToast = useToastAsync();

  const [data, setData] = useState<ContentItem[]>(props.contents);

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

  const mover = (de: number, para: number) =>
    setData((prev) => arrayMove(prev, de, para));

  // Cancelar/X com a ordem mexida descartava calado.
  const alterado = data.some((item, i) => item.id !== props.contents[i]?.id);
  const fechar = () => {
    if (alterado && !confirm("Descartar a nova ordem?")) return;
    props.handleClose();
  };

  const handleSave = () => {
    if (data.length === 0) return;
    const dto: ChangeOrderDTO = {
      orderedIds: data.map((item) => item.id),
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
      onSuccess: () => {
        props.aoSalvar?.(data);
        props.handleClose();
      },
    });
  };

  return (
    <ModalTemplate
      isOpen={props.isOpen}
      handleClose={fechar}
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
                  <th className="p-2">Status</th>
                  <th className="p-2">
                    <span className="sr-only">Mover</span>
                  </th>
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
                      onSubir={index > 0 ? () => mover(index, index - 1) : undefined}
                      onDescer={
                        index < data.length - 1
                          ? () => mover(index, index + 1)
                          : undefined
                      }
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </div>
        </DndContext>

        <div className="flex w-full justify-center gap-4 p-4 flex-wrap">
          <Button size="small" className="w-32" onClick={fechar}>
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

export default OrderEditContent;
