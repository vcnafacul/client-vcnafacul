import Toggle from "@/components/atoms/toggle";
import { InputFactory } from "@/components/organisms/inputFactory";
import ModalTemplate from "@/components/templates/modalTemplate";

import { useState } from "react";
import { toast } from "react-toastify";

interface AttendanceRecordProps {
  isOpen: boolean;
  handleClose: () => void;
  currentPresent: boolean;
  handleConfirm: (message: string, present: boolean) => void;
}

export function EditStudentRecordModal({
  isOpen,
  handleClose,
  currentPresent,
  handleConfirm,
}: AttendanceRecordProps) {
  const [present, setPresent] = useState(currentPresent);
  const [message, setMessage] = useState("");

  const handleToggleChange = () => {
    setPresent((prev) => !prev);
  };

  const handleSubmit = () => {
    if (!message) {
      toast.warning("Por favor, informe uma justificativa!", {
        theme: "dark",
      });
    } else {
      handleConfirm(message, present);
      handleClose();
    }
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
          handleCheck={handleToggleChange}
        />
      </div>

      <InputFactory
        id="message"
        label="Justificativa*"
        type="text"
        value={message}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setMessage(e.target.value)}
        maxLength={255}
      />

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
