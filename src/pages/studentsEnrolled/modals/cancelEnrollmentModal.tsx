import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  ENROLLMENT_CANCELLATION_REASONS,
  OTHER_CANCELLATION_REASON_LABEL,
  OTHER_CANCELLATION_REASON_PREFIX,
} from "@/enums/prepCourse/enrollmentCancellationReason";
import { Info } from "lucide-react";
import { useState } from "react";

/**
 * O default do Radix (700ms) faz a nota demorar a aparecer, e como cada
 * cada tooltip tem seu proprio Provider o atraso e pago de novo a cada icone.
 * 150ms mantem a leitura fluida sem disparar tooltip a toa ao atravessar a
 * lista com o mouse.
 */
const NOTE_TOOLTIP_DELAY_MS = 150;

interface CancelEnrollmentModalProps {
  isOpen: boolean;
  handleClose: () => void;
  handleConfirm: (reason: string) => void;
  text?: string;
}

/**
 * Modal de cancelamento de matricula com justificativas pre-definidas.
 *
 * Tem campos (motivos e texto livre), por isso e um `Dialog`, e nao um
 * `AlertDialog` (tickets/059 D21).
 */
export default function CancelEnrollmentModal({
  isOpen,
  handleClose,
  handleConfirm,
  text,
}: CancelEnrollmentModalProps) {
  // Nenhuma opcao vem pre-selecionada, para nao cancelar com o motivo errado
  // por descuido.
  const [selected, setSelected] = useState<string>("");
  const [otherReason, setOtherReason] = useState<string>("");

  const isOther = selected === OTHER_CANCELLATION_REASON_LABEL;
  const confirmDisabled = !selected || (isOther && !otherReason.trim());

  const buildReason = () =>
    isOther
      ? `${OTHER_CANCELLATION_REASON_PREFIX}${otherReason.trim()}`
      : selected;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(aberto) => {
        if (!aberto) handleClose();
      }}
      size="sm"
    >
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{text}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1">
          {ENROLLMENT_CANCELLATION_REASONS.map(({ label, note }) => (
            <div key={label} className="flex items-center gap-2">
              <label className="flex flex-1 cursor-pointer items-center gap-2 py-1">
                <input
                  type="radio"
                  name="enrollment-cancellation-reason"
                  value={label}
                  checked={selected === label}
                  onChange={() => setSelected(label)}
                  className="h-4 w-4 cursor-pointer accent-primary"
                />
                <span className="text-body">{label}</span>
              </label>
              {note && (
                <TooltipProvider delayDuration={NOTE_TOOLTIP_DELAY_MS}><Tooltip><TooltipTrigger asChild>
                  {/* Botao (e nao um icone solto) para que a nota tambem seja
                      alcancavel pelo foco do teclado, e nao so pelo mouse. */}
                  <button
                    type="button"
                    aria-label={`O que se enquadra em "${label}"`}
                    className="text-muted-foreground hover:text-muted-foreground focus-visible:text-muted-foreground"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger><TooltipContent>{note}</TooltipContent></Tooltip></TooltipProvider>
              )}
            </div>
          ))}
        </div>

        {isOther && (
          <Field label="Descreva o motivo">
            <Textarea
              // O campo aparece ao escolher "Outro": leva o foco junto.
            ref={(campo) => campo?.focus()}
              value={otherReason}
              onChange={(event) => setOtherReason(event.target.value)}
              placeholder="Descreva o motivo do cancelamento."
              className="resize-none"
            />
          </Field>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={confirmDisabled}
            onClick={() => handleConfirm(buildReason())}
          >
            Cancelar matrícula
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
