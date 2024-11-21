import { AlertDialogUI } from "@/components/atoms/alertDialogUI";
import { IconButton } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import { ReactNode } from "react";

interface ActionButtonProps {
  titleAlert: string;
  descriptionAlert?: string;
  onConfirm: () => void;
  children: ReactNode;
  tooltipTitle: string;
}

export function ActionButton(props: ActionButtonProps) {
  return (
    <AlertDialogUI
      title={props.titleAlert}
      description={props.descriptionAlert || ""}
      onConfirm={props.onConfirm}
    >
      <AlertDialogTrigger>
        <Tooltip title={props.tooltipTitle}>
          <IconButton>{props.children}</IconButton>
        </Tooltip>
      </AlertDialogTrigger>
    </AlertDialogUI>
  );
}
