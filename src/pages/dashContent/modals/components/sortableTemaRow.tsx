import { SubjectDto } from "@/dtos/content/contentDtoInput";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { StatusContent } from "@/enums/content/statusContent";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { GripVertical } from "lucide-react";
import { Roles } from "@/enums/roles/roles";
import { useAuthStore } from "@/store/auth";
import { FrentesActionMenu } from "./frentesActionMenu";
import { countByStatus } from "./countByStatus";

interface Props {
  tema: SubjectDto;
  onEdit: () => void;
  onReorderContents: () => void;
  onDelete?: () => void;
}

export function SortableTemaRow({
  tema,
  onEdit,
  onReorderContents,
  onDelete,
}: Props) {
  const id = tema._id || tema.id;
  // Reordenar temas é de quem gerencia demanda (o arrastar não conferia).
  const podeReordenar = !!useAuthStore().data.permissao[Roles.gerenciadorDemanda];
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const contents = tema.contents ?? [];
  const total = contents.length;
  const approved = countByStatus(contents, StatusEnum.Approved);
  const pending = countByStatus(contents, StatusEnum.Pending);
  const pendingUpload = countByStatus(contents, StatusContent.Pending_Upload);

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-state={isDragging ? "selected" : undefined}
      className={isDragging ? "opacity-50" : undefined}
    >
      <TableCell className="w-10 p-2">
        {podeReordenar && (
          <Button
            {...attributes}
            {...listeners}
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Arrastar o tema ${tema.name} para reordenar`}
            // Sem touch-none o toque vira rolagem e o arraste é cancelado.
            className={`touch-none text-muted-foreground hover:text-primary sm:h-8 sm:w-8 ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            <GripVertical />
          </Button>
        )}
      </TableCell>
      <TableCell>
        <span className="text-body font-medium">{tema.name}</span>
      </TableCell>
      <TableCell className="text-center">
        {approved}/{total}
      </TableCell>
      <TableCell className="text-center">
        {pending}/{total}
      </TableCell>
      <TableCell className="text-center">
        {pendingUpload}/{total}
      </TableCell>
      <TableCell className="w-10 text-center">
        <FrentesActionMenu
          onEdit={onEdit}
          onReorder={onReorderContents}
          onDelete={onDelete}
          menuType="tema"
          confirmarExclusao={`Excluir o tema ${tema.name}?`}
        />
      </TableCell>
    </TableRow>
  );
}
