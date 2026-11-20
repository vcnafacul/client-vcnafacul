import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { yupResolver } from "@hookform/resolvers/yup";
import { Calendar } from "primereact/calendar";
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
          <div className="card flex justify-content-center h-16 border pt-4 pl-4 rounded-md relative mb-4  row-start-3 col-start-1">
            <label
              className="absolute top-1 left-3 text-caption text-muted-foreground font-semibold"
              htmlFor="range"
            >
              Inicio - Fim
            </label>
            <Controller
              name="range"
              control={control}
              render={({ field }) => (
                <Calendar
                  id="range"
                  dateFormat="dd/mm/yy"
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  selectionMode="range"
                  className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full"
                  readOnlyInput
                  hideOnRangeSelection
                  appendTo="self"
                />
              )}
            />
            {errors.range && (
              <p className="absolute text-destructive text-caption mt-1 -bottom-5 left-0">
                {errors.range.message}
              </p>
            )}
          </div>
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
