import { SubjectDto } from "@/dtos/content/contentDtoInput";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { StatusContent } from "@/enums/content/statusContent";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconButton, TableCell, TableRow, Typography } from "@mui/material";
import { MdDragIndicator } from "react-icons/md";
import { FrentesActionMenu } from "./frentesActionMenu";

interface Props {
  tema: SubjectDto;
  onEdit: () => void;
  onReorderContents: () => void;
  onDelete?: () => void;
}

function countByStatus(
  contents: SubjectDto["contents"],
  status: StatusEnum | StatusContent,
) {
  return contents.filter((c) => c.status === status).length;
}

export function SortableTemaRow({
  tema,
  onEdit,
  onReorderContents,
  onDelete,
}: Props) {
  const id = tema._id || tema.id;
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
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? "rgba(25, 118, 210, 0.05)" : "transparent",
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
      sx={{
        "&:hover": {
          backgroundColor: isDragging
            ? "rgba(25, 118, 210, 0.05)"
            : "action.hover",
        },
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      <TableCell sx={{ width: 40, padding: "8px" }}>
        <IconButton
          {...attributes}
          {...listeners}
          size="small"
          sx={{
            cursor: "grab",
            "&:active": { cursor: "grabbing" },
            color: "grey.500",
            "&:hover": {
              color: "primary.main",
              backgroundColor: "primary.50",
            },
          }}
        >
          <MdDragIndicator size={20} />
        </IconButton>
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight="medium">
          {tema.name}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Typography variant="body2">
          {approved}/{total}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Typography variant="body2">
          {pending}/{total}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Typography variant="body2">
          {pendingUpload}/{total}
        </Typography>
      </TableCell>
      <TableCell align="center" className="w-10">
        <FrentesActionMenu
          onEdit={onEdit}
          onReorder={onReorderContents}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
}
