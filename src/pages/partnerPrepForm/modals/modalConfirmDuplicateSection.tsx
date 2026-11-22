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

interface ModalConfirmDuplicateSectionProps {
  isOpen: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
  sectionName: string;
}

export function ModalConfirmDuplicateSection({
  isOpen,
  handleClose,
  handleConfirm,
  sectionName,
}: ModalConfirmDuplicateSectionProps) {
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(aberto) => {
        if (!aberto) handleClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Duplicação de Seção</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-4 py-4">
              <p className="text-body text-foreground">
                Você tem certeza que deseja duplicar a seção{" "}
                <strong>{sectionName}</strong>?
              </p>
              <p className="text-body text-muted-foreground">
                Isso criará uma cópia completa da seção incluindo todas as
                questões associadas, com o nome "{sectionName} (cópia)". A cópia
                nasce desativada: revise e ative quando estiver pronta.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="primary" onClick={handleConfirm}>
            Duplicar seção
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
