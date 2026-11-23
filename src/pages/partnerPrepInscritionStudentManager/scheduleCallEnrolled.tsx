import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { yupResolver } from "@hookform/resolvers/yup";
import { Field } from "@/components/ui/field";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { paraIntervalo, paraPar } from "@/lib/datasBr";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  handleScheduleEnrolled: (range: Date[]) => void;
}

export function ScheduleCallEnrolle(props: Props) {
  const schema = yup
    .object()
    .shape({
      range: yup
        .array()
        .of(yup.date().required("Data obrigatória"))
        .length(2, "Selecione um intervalo de datas válido")
        .required("Campo obrigatório"), // Validando o array de datas com duas posições
    })
    .required();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scheduleEnrolled = (data: any) => {
    props.handleScheduleEnrolled(data.range);
  };

  useEffect(() => {
    register("range");
  }, []);

  return (
    <Dialog open={props.isOpen} onOpenChange={(o) => !o && props.handleClose()}>
      <DialogContent
        size="sm"
        aria-describedby={undefined}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Programar Convocação</DialogTitle>
        </DialogHeader>
        <form
          id="form-programar-convocacao"
          onSubmit={handleSubmit(scheduleEnrolled)}
        >
          <Controller
            name="range"
            control={control}
            render={({ field }) => (
              <Field label="Inicio - Fim" error={errors.range?.message}>
                <DateRangePicker
                  value={paraIntervalo(field.value)}
                  onChange={(r) => field.onChange(paraPar(r))}
                />
              </Field>
            )}
          />
        </form>
        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={props.handleClose}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="form-programar-convocacao"
          >
            Confirma
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
