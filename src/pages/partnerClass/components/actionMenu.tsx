import { AlertDialogUI } from "@/components/atoms/alertDialogUI";
import { Box, IconButton, Tooltip } from "@mui/material";
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import { Edit3, Eye, Plus, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

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
            <Plus className="h-4 w-4" />
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
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
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
            <Eye className="h-4 w-4" />
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
            <Edit3 className="h-4 w-4" />
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
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </AlertDialogTrigger>
            </AlertDialogUI>
          </span>
        </Tooltip>
      )}
    </Box>
  );
}
