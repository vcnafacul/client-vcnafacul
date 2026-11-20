import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
          startDate: dateRange[0]!.toLocaleDateString("en-CA"),
          endDate: dateRange[1]!.toLocaleDateString("en-CA"),
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
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Nova Justificativa de Período</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="period-range"
            className="text-caption text-muted-foreground font-semibold"
          >
            Período (início — fim)
          </label>
          <div className="flex flex-col justify-content-center border rounded-md px-3 py-2">
            <Calendar
              appendTo="self"
              inputId="period-range"
              dateFormat="dd/mm/yy"
              value={dateRange as Date[]}
              onChange={(e) => setDateRange(e.value as (Date | null)[])}
              selectionMode="range"
              className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md w-full"
              readOnlyInput
              numberOfMonths={1}
              minDate={
                coursePeriodStart ? new Date(coursePeriodStart) : undefined
              }
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

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={
              submitting ||
              !dateRange ||
              !dateRange[0] ||
              !dateRange[1] ||
              !justification.trim()
            }
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
