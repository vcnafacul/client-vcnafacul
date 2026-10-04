import Toggle from "@/components/atoms/toggle";
import { InputFactory } from "@/components/organisms/inputFactory";
import ModalTemplate from "@/components/templates/modalTemplate";
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
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-6 rounded-md w-[90vw] sm:w-[500px] h-auto flex flex-col gap-4"
    >
      <h2 className="text-lg font-semibold text-gray-800">Editar Presença</h2>

      <div className="flex items-center justify-between">
        <span className="text-gray-700">Presente:</span>
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
        <p className="text-xs text-gray-500">Descreva o motivo da alteração.</p>
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
          <p className="text-xs text-gray-500">
            Opcional. Preencha se o aluno justificou a falta (ex.: atestado).
            Deixe em branco para falta sem justificativa.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          onClick={handleClose}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Confirmar
        </button>
      </div>
    </ModalTemplate>
  );
}
