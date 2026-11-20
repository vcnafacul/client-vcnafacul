import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ModalType } from "../../../types/simulado/modalType";

interface ModalInfoProps {
  modal: ModalType;
}

// Pergunta que só se resolve por um dos botões: Esc e clique fora não fecham,
// porque o estado de quem abriu (finalizar, reportar) é decidido pelo botão.
function ModalInfo({ modal }: ModalInfoProps) {
  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{modal.title}</AlertDialogTitle>
          <AlertDialogDescription>{modal.subTitle}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {modal.buttons.map((btn, index) => (
            <Button key={index} variant={btn.variant} onClick={btn.onClick}>
              {btn.children}
            </Button>
          ))}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ModalInfo;
