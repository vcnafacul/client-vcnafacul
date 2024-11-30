import Text from "@/components/atoms/text";
import Button from "@/components/molecules/button";
import ModalTemplate from "@/components/templates/modalTemplate";

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
    <ModalTemplate {...props} className="bg-white p-4 rounded-md">
      <div className="px-4">
        <Text size="secondary">Programar Convocação </Text>
        <form onSubmit={handleSubmit(scheduleEnrolled)}>
          <div className="card flex justify-content-center h-16 border pt-4 pl-4 rounded-md relative mb-4  row-start-3 col-start-1">
            <label
              className="absolute top-1 left-3 text-xs text-grey font-semibold"
              htmlFor="date"
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
                  className="focus-visible:ring-orange w-full"
                  readOnlyInput
                  hideOnRangeSelection
                />
              )}
            />
            {errors.range && (
              <p className="absolute text-red text-xs mt-1 -bottom-5 left-0">
                {errors.range.message}
              </p>
            )}
          </div>
          <div className="flex gap-4 mt-6">
            <Button
              size="small"
              typeStyle="secondary"
              className="w-full"
              type="button"
              onClick={props.handleClose}
            >
              Cancelar
            </Button>
            <Button size="small" className="w-full">
              Confirma
            </Button>
          </div>
        </form>
      </div>
    </ModalTemplate>
  );
}
