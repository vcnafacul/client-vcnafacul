import { AlertDialogUI } from "@/components/atoms/alertDialogUI";
import { Box, IconButton, Tooltip } from "@mui/material";
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
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
  mensagemExclusao = "Tem certeza que deseja excluir?",
  tamanho = "small",
}: {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
  onToggle?: () => void;
  isActive?: boolean;
  /** O excluir sempre pede confirmação; este é o texto dela. */
  mensagemExclusao?: string;
  /** `medium` (~40px) no celular, onde o alvo de toque pequeno erra. */
  tamanho?: "small" | "medium";
}) {
  return (
    <Box className="flex gap-1 w-full justify-center">
      {onAdd && (
        <Tooltip title="Adicionar Turma" arrow>
          <IconButton
            size={tamanho}
            onClick={onAdd}
            sx={{ color: "primary.main" }}
          >
            <FaPlus className="h-4 w-4" />
          </IconButton>
        </Tooltip>
      )}
      {onToggle && (
        <Tooltip
          title={isActive ? "Desativar Período" : "Ativar Período"}
          arrow
        >
          <IconButton
            size={tamanho}
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
            size={tamanho}
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
            size={tamanho}
            onClick={onEdit}
            sx={{ color: "warning.main" }}
          >
            <FiEdit3 className="h-4 w-4" />
          </IconButton>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip title="Excluir" arrow>
          <span>
            <AlertDialogUI
              title={mensagemExclusao}
              description="Esta ação não pode ser desfeita."
              onConfirm={onDelete}
            >
              <AlertDialogTrigger asChild>
                <IconButton
                  size={tamanho}
                  aria-label="Excluir"
                  sx={{ color: "error.main" }}
                >
                  <FiTrash2 className="h-4 w-4" />
                </IconButton>
              </AlertDialogTrigger>
            </AlertDialogUI>
          </span>
        </Tooltip>
      )}
    </Box>
  );
}
