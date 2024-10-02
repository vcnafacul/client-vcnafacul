import ModalTemplate from "@/components/templates/modalTemplate";
import { Inscription } from "@/types/partnerPrepCourse/inscription";

interface InscriptionInfoModalProps {
  isOpen: boolean;
  handleClose: () => void;
  inscription?: Inscription;
}

export function InscriptionInfoModal({
  isOpen,
  handleClose,
  inscription,
}: InscriptionInfoModalProps) {
  return (
    <ModalTemplate isOpen={isOpen} handleClose={handleClose} outSideClose>
      <div>{inscription?.name}</div>
    </ModalTemplate>
  );
}
