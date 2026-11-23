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
import { ReactNode } from "react";

interface ActionButtonProps {
  titleAlert: string;
  descriptionAlert?: string;
  /** Verbo e objeto da ação, como "Resetar aluno": o botão nomeia o que faz. */
  actionLabel: string;
  /** `destructive` para o que remove, reseta ou descarta; o resto é `primary`. */
  variant?: "primary" | "destructive";
  onConfirm: () => void;
  children: ReactNode;
  tooltipTitle: string;
}

export function ActionButton(props: ActionButtonProps) {
  return (
    <AlertDialog>
      <TooltipProvider><Tooltip><TooltipTrigger asChild>
        <AlertDialogTrigger asChild>
          <Button size="icon" variant="ghost" aria-label={props.tooltipTitle}>
            {props.children}
          </Button>
        </AlertDialogTrigger>
      </TooltipTrigger><TooltipContent>{props.tooltipTitle}</TooltipContent></Tooltip></TooltipProvider>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{props.titleAlert}</AlertDialogTitle>
          <AlertDialogDescription>
            {props.descriptionAlert || ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant={props.variant ?? "primary"}
            onClick={props.onConfirm}
          >
            {props.actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
