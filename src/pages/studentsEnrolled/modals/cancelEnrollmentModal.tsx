import { ShadcnTooltip } from "@/components/atoms/shadnTooltip";
import ModalConfirmCancel from "@/components/organisms/modalConfirmCancel";
import {
  ENROLLMENT_CANCELLATION_REASONS,
  OTHER_CANCELLATION_REASON_LABEL,
  OTHER_CANCELLATION_REASON_PREFIX,
} from "@/enums/prepCourse/enrollmentCancellationReason";
import { Info } from "lucide-react";
import { useState } from "react";

/**
 * O default do Radix (700ms) faz a nota demorar a aparecer, e como cada
 * ShadcnTooltip tem seu proprio Provider o atraso e pago de novo a cada icone.
 * 150ms mantem a leitura fluida sem disparar tooltip a toa ao atravessar a
 * lista com o mouse.
 */
const NOTE_TOOLTIP_DELAY_MS = 150;

interface CancelEnrollmentModalProps {
  isOpen: boolean;
  handleClose: () => void;
  handleConfirm: (reason: string) => void;
  text?: string;
  className?: string;
}

/**
 * Modal de cancelamento de matricula com justificativas pre-definidas.
 *
 * Nao reaproveita o `ModalConfirmCancelMessage` de proposito: aquele
 * componente e compartilhado por outras 3 telas, e mexer nele para atender so
 * esta quebraria as demais.
 */
export default function CancelEnrollmentModal({
  isOpen,
  handleClose,
  handleConfirm,
  text,
  className,
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
    <ModalConfirmCancel
      isOpen={isOpen}
      handleClose={handleClose}
      handleConfirm={() => handleConfirm(buildReason())}
      text={text}
      confirmDisabled={confirmDisabled}
      className={className}
    >
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
                className="h-4 w-4 cursor-pointer accent-orange"
              />
              <span className="text-sm">{label}</span>
            </label>
            {note && (
              <ShadcnTooltip content={note} delayDuration={NOTE_TOOLTIP_DELAY_MS}>
                {/* Botao (e nao um icone solto) para que a nota tambem seja
                    alcancavel pelo foco do teclado, e nao so pelo mouse. */}
                <button
                  type="button"
                  aria-label={`O que se enquadra em "${label}"`}
                  className="text-gray-400 hover:text-gray-600 focus-visible:text-gray-600"
                >
                  <Info className="h-4 w-4" />
                </button>
              </ShadcnTooltip>
            )}
          </div>
        ))}
      </div>

      {isOther && (
        <textarea
          autoFocus
          value={otherReason}
          onChange={(event) => setOtherReason(event.target.value)}
          placeholder="Descreva o motivo do cancelamento."
          className="h-full min-h-[100px] w-full resize-none rounded border border-gray-400 p-2"
        />
      )}
    </ModalConfirmCancel>
  );
}
