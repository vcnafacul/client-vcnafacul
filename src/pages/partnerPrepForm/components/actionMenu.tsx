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
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, Edit3, Eye, Plus, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { type ReactNode } from "react";

/** Botão de ícone com o nome acessível e o tooltip com o mesmo texto. */
function AcaoIcone({
  rotulo,
  onClick,
  className,
  children,
}: {
  rotulo: string;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={rotulo}
          onClick={onClick}
          className={className}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{rotulo}</TooltipContent>
    </Tooltip>
  );
}

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
  // `small` encolhe o alvo a partir de sm (tabela densa); `medium` mantém o do botão.
  const tamanhoClasse = tamanho === "small" ? "sm:h-8 sm:w-8" : "";

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-wrap gap-1">
        {onAdd && (
          <AcaoIcone rotulo="Adicionar Questão" onClick={onAdd} className={tamanhoClasse}>
            <Plus />
          </AcaoIcone>
        )}
        {onToggle && (
          <AcaoIcone
            rotulo={isActive ? "Desativar Seção" : "Ativar Seção"}
            onClick={onToggle}
            className={`${
              isActive
                ? "text-success hover:text-destructive"
                : "text-muted-foreground hover:text-success"
            } ${tamanhoClasse}`.trim()}
          >
            {isActive ? <ToggleRight /> : <ToggleLeft />}
          </AcaoIcone>
        )}
        {onView && (
          <AcaoIcone rotulo="Visualizar" onClick={onView} className={tamanhoClasse}>
            <Eye />
          </AcaoIcone>
        )}
        {onEdit && (
          <AcaoIcone rotulo="Editar" onClick={onEdit} className={tamanhoClasse}>
            <Edit3 />
          </AcaoIcone>
        )}
        {onDuplicate && (
          <AcaoIcone
            rotulo="Duplicar Seção"
            onClick={onDuplicate}
            className={tamanhoClasse}
          >
            <Copy />
          </AcaoIcone>
        )}
        {onDelete && (
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
                <AlertDialogTitle>{mensagemExclusao}</AlertDialogTitle>
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
