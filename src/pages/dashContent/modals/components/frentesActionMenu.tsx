import { AlertDialogUI } from "@/components/atoms/alertDialogUI";
import { Roles } from "@/enums/roles/roles";
import { useAuthStore } from "@/store/auth";
import { Box, IconButton, Tooltip } from "@mui/material";
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import { ArrowUpDown, Edit3, Plus, Trash2 } from "lucide-react";

interface Props {
  onAdd?: () => void;
  onEdit?: () => void;
  onReorder?: () => void;
  onDelete?: () => void;
  addLabel?: string;
  menuType?: "frente" | "tema";
  /** Com texto, o excluir pede confirmação antes (tema apagava direto). */
  confirmarExclusao?: string;
  /** `medium` (~40px) no celular. */
  tamanho?: "small" | "medium";
}

export function FrentesActionMenu({
  onAdd,
  onEdit,
  onReorder,
  onDelete,
  addLabel = "Adicionar",
  menuType = "frente",
  confirmarExclusao,
  tamanho = "small",
}: Props) {
  const {
    data: { permissao },
  } = useAuthStore();
  const manager: boolean =
    permissao[
      menuType == "frente"
        ? Roles.editarMateriasFrentes
        : Roles.gerenciadorDemanda
    ];

  return (
    <Box className="flex flex-wrap gap-1 w-full justify-center">
      {/* O "+" também exige a permissão, como editar e excluir. */}
      {onAdd && manager && (
        <Tooltip title={addLabel} arrow>
          <IconButton
            size={tamanho}
            onClick={onAdd}
            sx={{ color: "primary.main" }}
          >
            <Plus className="h-4 w-4" />
          </IconButton>
        </Tooltip>
      )}
      {onEdit && manager && (
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
      {onReorder && manager && (
        <Tooltip title="Editar ordem conteúdos" arrow>
          <IconButton
            size={tamanho}
            onClick={onReorder}
            sx={{ color: "text.secondary" }}
          >
            <ArrowUpDown className="h-5 w-5" />
          </IconButton>
        </Tooltip>
      )}
      {onDelete && manager && !confirmarExclusao && (
        <Tooltip title="Excluir" arrow>
          <IconButton
            size={tamanho}
            onClick={onDelete}
            sx={{ color: "error.main" }}
          >
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </Tooltip>
      )}
      {onDelete && manager && confirmarExclusao && (
        <Tooltip title="Excluir" arrow>
          <span>
            <AlertDialogUI
              title={confirmarExclusao}
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
