import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { textoDoCaderno, TITULO_CADERNO_ANULADAS } from "./textos";

/**
 * Gerar caderno de prova com anulada (tickets/042, D8). Ela sai com o selo
 * "QUESTÃO ANULADA: não responda" — o modal diz isso antes, e como evitar.
 */
export function ModalCadernoComAnuladas({
  numeros,
  onConfirmar,
  onCancelar,
}: {
  numeros: number[];
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  const paragrafos = textoDoCaderno(numeros);
  return (
    <Dialog open onOpenChange={(o) => !o && onCancelar()}>
      <DialogContent size="md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-start gap-2">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-warning"
              aria-hidden
            />
            {TITULO_CADERNO_ANULADAS}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 text-body text-foreground">
          {paragrafos.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button onClick={onConfirmar}>Gerar mesmo assim</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
