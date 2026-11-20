import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Copy, Edit3, Eye, Plus, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

export function ActionMenu({
  onView,
  onEdit,
  onDelete,
  onAdd,
  onToggle,
  onDuplicate,
  isActive,
  mensagemExclusao = "Tem certeza que deseja excluir?",
  tamanho = "small",
}: {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
  onToggle?: () => void;
  onDuplicate?: () => void;
  isActive?: boolean;
  /** O excluir sempre pede confirmação; este é o texto dela. */
  mensagemExclusao?: string;
  /** `medium` (~40px) no celular, onde o alvo de toque pequeno erra. */
  tamanho?: "small" | "medium";
}) {
  return (
    <Box className="flex flex-wrap gap-1">
      {onAdd && (
        <Tooltip title="Adicionar Questão" arrow>
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
        <Tooltip title={isActive ? "Desativar Seção" : "Ativar Seção"} arrow>
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
      {onDuplicate && (
        <Tooltip title="Duplicar Seção" arrow>
          <IconButton
            size={tamanho}
            onClick={onDuplicate}
            sx={{ color: "info.main" }}
          >
            <Copy className="h-4 w-4" />
          </IconButton>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip title="Excluir" arrow>
          <span>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <IconButton
                  size={tamanho}
                  aria-label="Excluir"
                  sx={{ color: "error.main" }}
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{mensagemExclusao}</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={onDelete}
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </span>
        </Tooltip>
      )}
    </Box>
  );
}
