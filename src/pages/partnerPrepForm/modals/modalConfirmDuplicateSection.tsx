import ModalConfirmCancel from "@/components/organisms/modalConfirmCancel";
import { Typography } from "@mui/material";

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
    <ModalConfirmCancel
      isOpen={isOpen}
      handleClose={handleClose}
      handleConfirm={handleConfirm}
      text="Confirmar Duplicação de Seção"
    >
      <div className="flex flex-col gap-4 py-4">
        <Typography variant="body1">
          Você tem certeza que deseja duplicar a seção{" "}
          <strong>{sectionName}</strong>?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Isso criará uma cópia completa da seção incluindo todas as questões
          associadas.
        </Typography>
      </div>
    </ModalConfirmCancel>
  );
}
