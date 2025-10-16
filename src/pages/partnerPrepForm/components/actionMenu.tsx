import { Box, IconButton, Tooltip } from "@mui/material";
import { FaPlus } from "react-icons/fa";
import {
  FiEdit3,
  FiEye,
  FiToggleLeft,
  FiToggleRight,
  FiTrash2,
} from "react-icons/fi";

export function ActionMenu({
  onView,
  onEdit,
  onDelete,
  onAdd,
  onToggle,
  isActive,
}: {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
  onToggle?: () => void;
  isActive?: boolean;
}) {
  return (
    <Box className="flex gap-1">
      {onAdd && (
        <Tooltip title="Adicionar Questão" arrow>
          <IconButton
            size="small"
            onClick={onAdd}
            sx={{ color: "primary.main" }}
          >
            <FaPlus className="h-4 w-4" />
          </IconButton>
        </Tooltip>
      )}
      {onToggle && (
        <Tooltip title={isActive ? "Desativar Seção" : "Ativar Seção"} arrow>
          <IconButton
            size="small"
            onClick={onToggle}
            sx={{
              color: isActive ? "success.main" : "text.secondary",
              "&:hover": {
                color: isActive ? "error.main" : "success.main",
              },
            }}
          >
            {isActive ? (
              <FiToggleRight className="h-4 w-4" />
            ) : (
              <FiToggleLeft className="h-4 w-4" />
            )}
          </IconButton>
        </Tooltip>
      )}
      {onView && (
        <Tooltip title="Visualizar" arrow>
          <IconButton
            size="small"
            onClick={onView}
            sx={{ color: "primary.main" }}
          >
            <FiEye className="h-4 w-4" />
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
