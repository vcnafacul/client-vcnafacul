import ModalTemplate from "@/components/templates/modalTemplate";
import { useToastAsync } from "@/hooks/useToastAsync";
import { createPeriodJustification } from "@/services/prepCourse/periodJustification/createPeriodJustification";
import { useAuthStore } from "@/store/auth";
import { Calendar } from "primereact/calendar";
import { useState } from "react";

interface PeriodJustificationModalProps {
  isOpen: boolean;
  handleClose: () => void;
  studentCourseId: string;
  onSuccess: () => void;
  coursePeriodStart?: Date;
  coursePeriodEnd?: Date;
}

export function PeriodJustificationModal({
  isOpen,
  handleClose,
  studentCourseId,
  onSuccess,
  coursePeriodStart,
  coursePeriodEnd,
}: PeriodJustificationModalProps) {
  const [dateRange, setDateRange] = useState<(Date | null)[] | null>(null);
  const [justification, setJustification] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    data: { token },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  const handleConfirm = async () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      return;
    }
    if (!justification.trim()) {
      return;
    }

    setSubmitting(true);
    await executeAsync({
      action: () =>
        createPeriodJustification(token, {
          studentCourseId,
          startDate: dateRange[0]!.toLocaleDateString('en-CA'),
          endDate: dateRange[1]!.toLocaleDateString('en-CA'),
          justification: justification.trim(),
        }),
      loadingMessage: "Criando justificativa de período...",
      successMessage: "Justificativa de período criada com sucesso!",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => {
        onSuccess();
        handleClose();
      },
      onFinally: () => {
        setSubmitting(false);
      },
    });
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-6 rounded-md w-[90vw] sm:w-[520px] h-auto flex flex-col gap-4"
    >
      <h2 className="text-lg font-semibold text-gray-800">
        Nova Justificativa de Período
      </h2>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-grey font-semibold">
          Período (início — fim)
        </label>
        <div className="flex flex-col justify-content-center border rounded-md px-3 py-2">
          <Calendar
            id="period-range"
            dateFormat="dd/mm/yy"
            value={dateRange as Date[]}
            onChange={(e) => setDateRange(e.value as (Date | null)[])}
            selectionMode="range"
            className="focus-visible:ring-orange rounded-md w-full"
            readOnlyInput
            numberOfMonths={1}
            minDate={coursePeriodStart ? new Date(coursePeriodStart) : undefined}
            maxDate={coursePeriodEnd ? new Date(coursePeriodEnd) : undefined}
            placeholder="Selecione o período"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label
          className="text-xs text-grey font-semibold"
          htmlFor="justification-input"
        >
          Justificativa *
        </label>
        <textarea
          id="justification-input"
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          maxLength={255}
          rows={3}
          className="border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-marine"
          placeholder="Descreva a justificativa..."
        />
        <span className="text-xs text-gray-400 text-right">
          {justification.length}/255
        </span>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={handleClose}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          disabled={submitting}
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          disabled={
            submitting ||
            !dateRange ||
            !dateRange[0] ||
            !dateRange[1] ||
            !justification.trim()
          }
          className="bg-marine hover:opacity-90 text-white font-bold py-2 px-4 rounded
            disabled:bg-opacity-75 disabled:cursor-not-allowed"
        >
          Confirmar
        </button>
      </div>
    </ModalTemplate>
  );
}
