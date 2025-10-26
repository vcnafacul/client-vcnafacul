import Button from "@/components/molecules/button";
import ModalTemplate from "@/components/templates/modalTemplate";
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
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-6 rounded-md"
    >
      <div className="sm:min-w-[500px] flex flex-col gap-6">
        <h1 className="text-marine text-2xl font-bold">
          Prorrogar Processo Seletivo
        </h1>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit(resolver)}>
          <div>
            <Label
              htmlFor="endDate"
              className="text-sm text-gray-700 font-semibold block mb-1"
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
                  className="w-full"
                  minDate={
                    currentEndDate ? new Date(currentEndDate) : new Date()
                  }
                />
              )}
            />
            {errors.endDate && (
              <p className="text-red text-xs mt-1">{errors.endDate.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              typeStyle="secondary"
              className="w-24 h-9"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button typeStyle="primary" className="w-24 h-9" type="submit">
              Confirmar
            </Button>
          </div>
        </form>
      </div>
    </ModalTemplate>
  );
}
