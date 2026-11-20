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
import { IconButton } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
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
      <AlertDialogTrigger>
        <Tooltip title={props.tooltipTitle}>
          <IconButton>{props.children}</IconButton>
        </Tooltip>
      </AlertDialogTrigger>
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
