import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { yupResolver } from "@hookform/resolvers/yup";
import { DatePicker } from "@/components/ui/date-picker";
import { Field } from "@/components/ui/field";
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
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <Field label="Nova Data de Fim" error={errors.endDate?.message}>
                <DatePicker
                  value={field.value}
                  onChange={(d) => d && field.onChange(d)}
                  min={currentEndDate ? new Date(currentEndDate) : new Date()}
                />
              </Field>
            )}
          />
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
