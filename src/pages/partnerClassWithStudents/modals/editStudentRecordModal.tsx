import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Field, FormLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
          <Label htmlFor="presente-na-aula" className="text-body text-foreground">
            Presente:
          </Label>
          <Switch
            id="presente-na-aula"
            checked={present}
            onCheckedChange={setPresent}
          />
        </div>

        <FormLegend />
        <Field
          label="Observação"
          required
          maxLength={255}
          hint="Descreva o motivo da alteração."
        >
          <Input
            id="observation"
            type="text"
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
          />
        </Field>

        {!present && (
          <Field
            label="Justificativa"
            maxLength={255}
            hint="Opcional. Preencha se o aluno justificou a falta (ex.: atestado). Deixe em branco para falta sem justificativa."
          >
            <Input
              id="justification"
              type="text"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          </Field>
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
