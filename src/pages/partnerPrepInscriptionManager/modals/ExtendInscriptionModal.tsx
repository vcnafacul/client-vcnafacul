import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { yupResolver } from "@hookform/resolvers/yup";
import { Calendar } from "primereact/calendar";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

interface ExtendInscriptionModalProps {
  isOpen: boolean;
  handleClose: () => void;
  handleConfirm: (date: Date) => void;
  currentEndDate?: Date;
}

export function ExtendInscriptionModal({
  isOpen,
  handleClose,
  handleConfirm,
  currentEndDate,
}: ExtendInscriptionModalProps) {
  const schema = yup
    .object()
    .shape({
      endDate: yup.date().required("Data obrigatória"),
    })
    .required();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      endDate: currentEndDate ? new Date(currentEndDate) : new Date(),
    },
  });

  const resolver = (data: { endDate: Date }) => {
    handleConfirm(data.endDate);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        size="md"
        aria-describedby={undefined}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Prorrogar Processo Seletivo</DialogTitle>
        </DialogHeader>

        <form
          id="form-prorrogar-inscricao"
          className="flex flex-col gap-6"
          onSubmit={handleSubmit(resolver)}
        >
          <div>
            <Label
              htmlFor="endDate"
              className="text-body text-foreground font-semibold block mb-1"
            >
              Nova Data de Fim
            </Label>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <Calendar
                  id="endDate"
                  dateFormat="dd/mm/yy"
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  readOnlyInput
                  appendTo="self"
                  className="w-full"
                  minDate={
                    currentEndDate ? new Date(currentEndDate) : new Date()
                  }
                />
              )}
            />
            {errors.endDate && (
              <p className="text-destructive text-caption mt-1">{errors.endDate.message}</p>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="form-prorrogar-inscricao"
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
