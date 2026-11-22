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
import { Roles } from "@/enums/roles/roles";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowUpDown, Edit3, Plus, Trash2 } from "lucide-react";
import { forwardRef, type ReactNode } from "react";

/** Botão de ícone com o nome acessível e o tooltip com o mesmo texto. */
const AcaoIcone = forwardRef<
  HTMLButtonElement,
  {
    rotulo: string;
    onClick?: () => void;
    className?: string;
    children: ReactNode;
  }
>(({ rotulo, onClick, className, children, ...resto }, ref) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        ref={ref}
        type="button"
        variant="ghost"
        size="icon"
        aria-label={rotulo}
        onClick={onClick}
        className={className}
        {...resto}
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent>{rotulo}</TooltipContent>
  </Tooltip>
));
AcaoIcone.displayName = "AcaoIcone";

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

  // `small` encolhe o alvo a partir de sm (tabela densa); `medium` mantém o do botão.
  const tamanhoClasse = tamanho === "small" ? "sm:h-8 sm:w-8" : "";

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex w-full flex-wrap justify-center gap-1">
        {/* O "+" também exige a permissão, como editar e excluir. */}
        {onAdd && manager && (
          <AcaoIcone rotulo={addLabel} onClick={onAdd} className={tamanhoClasse}>
            <Plus />
          </AcaoIcone>
        )}
        {onEdit && manager && (
          <AcaoIcone rotulo="Editar" onClick={onEdit} className={tamanhoClasse}>
            <Edit3 />
          </AcaoIcone>
        )}
        {onReorder && manager && (
          <AcaoIcone
            rotulo="Editar ordem conteúdos"
            onClick={onReorder}
            className={tamanhoClasse}
          >
            <ArrowUpDown />
          </AcaoIcone>
        )}
        {onDelete && manager && !confirmarExclusao && (
          <AcaoIcone
            rotulo="Excluir"
            onClick={onDelete}
            className={`text-destructive ${tamanhoClasse}`.trim()}
          >
            <Trash2 />
          </AcaoIcone>
        )}
        {onDelete && manager && confirmarExclusao && (
          <AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Excluir"
                    className={`text-destructive ${tamanhoClasse}`.trim()}
                  >
                    <Trash2 />
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>Excluir</TooltipContent>
            </Tooltip>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{confirmarExclusao}</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={onDelete}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </TooltipProvider>
  );
}
