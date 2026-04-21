import { Box, IconButton, Tooltip } from "@mui/material";
import { CgArrowsExchangeAltV } from "react-icons/cg";
import { FaPlus } from "react-icons/fa";
import { FiEdit3, FiTrash2 } from "react-icons/fi";

interface Props {
  onAdd?: () => void;
  onEdit?: () => void;
  onReorder?: () => void;
  onDelete?: () => void;
  addLabel?: string;
}

export function FrentesActionMenu({
  onAdd,
  onEdit,
  onReorder,
  onDelete,
  addLabel = "Adicionar",
}: Props) {
  return (
    <Box className="flex gap-1 w-full justify-center">
      {onAdd && (
        <Tooltip title={addLabel} arrow>
          <IconButton
            size="small"
            onClick={onAdd}
            sx={{ color: "primary.main" }}
          >
            <FaPlus className="h-4 w-4" />
          </IconButton>
        </Tooltip>
      )}
      {onEdit && (
        <Tooltip title="Editar" arrow>
          <IconButton
            size="small"
            onClick={onEdit}
            sx={{ color: "warning.main" }}
          >
            <FiEdit3 className="h-4 w-4" />
          </IconButton>
        </Tooltip>
      )}
      {onReorder && (
        <Tooltip title="Editar ordem conteúdos" arrow>
          <IconButton
            size="small"
            onClick={onReorder}
            sx={{ color: "text.secondary" }}
          >
            <CgArrowsExchangeAltV className="h-5 w-5" />
          </IconButton>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip title="Excluir" arrow>
          <IconButton
            size="small"
            onClick={onDelete}
            sx={{ color: "error.main" }}
          >
            <FiTrash2 className="h-4 w-4" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
