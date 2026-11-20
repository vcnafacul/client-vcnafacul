import ModalTemplate from "@/components/templates/modalTemplate";
import { useToastAsync } from "@/hooks/useToastAsync";
import { createPeriodJustification } from "@/services/prepCourse/periodJustification/createPeriodJustification";
import { mensagemDeErro } from "@/utils/mensagemDeErro";
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
      errorMessage: (error: unknown) =>
        mensagemDeErro(
          error,
          "justificar período",
          "Erro ao criar justificativa de período",
        ),
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
      <h2 className="text-h3 font-semibold text-foreground">
        Nova Justificativa de Período
      </h2>

      <div className="flex flex-col gap-1">
        <label className="text-caption text-muted-foreground font-semibold">
          Período (início — fim)
        </label>
        <div className="flex flex-col justify-content-center border rounded-md px-3 py-2">
          <Calendar
            id="period-range"
            dateFormat="dd/mm/yy"
            value={dateRange as Date[]}
            onChange={(e) => setDateRange(e.value as (Date | null)[])}
            selectionMode="range"
            className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md w-full"
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
          className="text-caption text-muted-foreground font-semibold"
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
          className="border rounded-md px-3 py-2 text-body resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="Descreva a justificativa..."
        />
        <span className="text-caption text-muted-foreground text-right">
          {justification.length}/255
        </span>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={handleClose}
          className="px-4 py-2 text-foreground bg-muted rounded-md hover:bg-accent"
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
          className="bg-primary hover:opacity-90 text-primary-foreground font-bold py-2 px-4 rounded-sm
            disabled:bg-opacity-75 disabled:cursor-not-allowed"
        >
          Confirmar
        </button>
      </div>
    </ModalTemplate>
  );
}
