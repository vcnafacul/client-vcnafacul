import Toggle from "@/components/atoms/toggle";
import { InputFactory } from "@/components/organisms/inputFactory";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { EdicaoDePresenca } from "@/services/prepCourse/attendanceRecord/updateRegisterStudent";

import { useState } from "react";
import { toast } from "react-toastify";

interface AttendanceRecordProps {
  isOpen: boolean;
  handleClose: () => void;
  currentPresent: boolean;
  /** A justificativa atual: vem preenchida e, apagada, é removida. */
  currentJustification?: string;
  handleConfirm: (edicao: EdicaoDePresenca) => void;
}

/**
 * Editar a presença de um aluno (tickets-documentacao, card 05).
 *
 * ⚠️ **Observação ≠ justificativa.** Antes, o único campo era "Justificativa*",
 * obrigatório: toda correção de chamada virava falta justificada. Agora a
 * Observação (obrigatória) diz por que mudou e não entra no cálculo; a
 * Justificativa é opcional e só existe para Ausente.
 */
export function EditStudentRecordModal({
  isOpen,
  handleClose,
  currentPresent,
  currentJustification,
  handleConfirm,
}: AttendanceRecordProps) {
  const [present, setPresent] = useState<boolean>(!!currentPresent);
  const [observation, setObservation] = useState("");
  const [justification, setJustification] = useState(
    currentJustification ?? "",
  );

  const handleSubmit = () => {
    if (!observation.trim()) {
      toast.warning("Por favor, informe uma observação!", { theme: "dark" });
      return;
    }
    handleConfirm(
      present
        ? { present, observation: observation.trim() }
        : {
            present,
            observation: observation.trim(),
            justification: justification.trim(),
          },
    );
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Editar Presença</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between">
          <span className="text-foreground">Presente:</span>
          <Toggle
            name="attendance"
            checked={present}
            handleCheck={() => setPresent((prev) => !prev)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <InputFactory
            id="observation"
            label="Observação*"
            type="text"
            value={observation}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e: any) => setObservation(e.target.value)}
            maxLength={255}
          />
          <p className="text-caption text-muted-foreground">
            Descreva o motivo da alteração.
          </p>
        </div>

        {!present && (
          <div className="flex flex-col gap-1">
            <InputFactory
              id="justification"
              label="Justificativa"
              type="text"
              value={justification}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e: any) => setJustification(e.target.value)}
              maxLength={255}
            />
            <p className="text-caption text-muted-foreground">
              Opcional. Preencha se o aluno justificou a falta (ex.: atestado).
              Deixe em branco para falta sem justificativa.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
