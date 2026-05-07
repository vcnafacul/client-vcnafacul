import { LuHeadset } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
}

export function ConfirmOpenDialog({
  open,
  onOpenChange,
  onConfirm,
  loading,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mx-auto h-12 w-12 rounded-full bg-marine flex items-center justify-center mb-2">
            <LuHeadset className="h-6 w-6 text-orange" />
          </div>
          <DialogTitle className="text-center text-marine font-raleway">
            Falar com o suporte
          </DialogTitle>
          <DialogDescription className="text-center">
            Você abrirá uma nova conversa com nossa equipe. Deseja continuar?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-orange hover:bg-darkOrange text-white"
          >
            {loading ? "Abrindo..." : "Sim, abrir conversa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
