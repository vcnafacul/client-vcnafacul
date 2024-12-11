import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertDialogTriggerProps } from "@radix-ui/react-alert-dialog";

interface AlertDialogUIProps {
  title: string;
  description: string;
  onConfirm: () => void;
  children: React.ReactElement<AlertDialogTriggerProps>;
}

export const AlertDialogUI = ({
  title,
  description,
  onConfirm,
  children,
}: AlertDialogUIProps) => {
  return (
    <AlertDialog>
      {children}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-marine">{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border border-orange text-orange hover:bg-orange hover:border-orange/20 hover:text-white">Cancelar</AlertDialogCancel>
          <AlertDialogAction className="bg-orange text-white hover:bg-orange/80" onClick={onConfirm}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
