import { InputFactory } from "@/components/organisms/inputFactory";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CoursePeriodEntity,
  CoursePeriodOutput,
} from "@/services/prepCourse/coursePeriod/createCoursePeriod";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@mui/material/Button";
import { Calendar } from "primereact/calendar";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

interface CoursePeriodCreateEditModalProps {
  isOpen: boolean;
  handleClose: () => void;
  entity?: CoursePeriodEntity; // Se undefined = criação, se definido = edição
  onCreate: (dto: CoursePeriodOutput) => void;
  onEdit: (dto: CoursePeriodOutput & { id: string }) => void;
}

export function CoursePeriodCreateEditModal({
  isOpen,
  handleClose,
  entity,
  onCreate,
  onEdit,
}: CoursePeriodCreateEditModalProps) {
  const isEdit = !!entity;

  const schema = yup
    .object()
    .shape({
      name: yup.string().default(entity?.name).required("Nome é obrigatório"),
      startDate: yup
        .date()
        .default(entity?.startDate)
        .required("Data de início é obrigatória"),
      endDate: yup
        .date()
        .default(entity?.endDate)
        .required("Data de fim é obrigatória")
        .test(
          "endDate-greater-than-startDate",
          "Data de fim deve ser maior que a data de início",
          function (value) {
            const { startDate } = this.parent;
            if (!startDate || !value) return true;
            return new Date(value) > new Date(startDate);
          }
        ),
    })
    .required();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<CoursePeriodOutput>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: CoursePeriodOutput) => {
    if (isEdit) {
      onEdit({ ...data, id: entity!.id });
    } else {
      onCreate(data);
    }
    reset();
    handleClose();
  };

  useEffect(() => {
    register("name");
    register("startDate");
    register("endDate");

    // Reset form quando modal abre/fecha ou entity muda
    if (isOpen) {
      reset({
        name: entity?.name || "",
        startDate: entity?.startDate || new Date(),
        endDate: entity?.endDate || new Date(),
      });
    }
  }, [register, reset, isOpen, entity]);

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Período Letivo" : "Novo Período Letivo"}</DialogTitle>
        </DialogHeader>

        <form
          id="form-periodo-letivo"
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Nome do Período */}
          <InputFactory
            id="name"
            label="Nome do Período"
            type="text"
            placeholder="Ex: 1º Semestre 2024"
            defaultValue={entity?.name}
            error={errors.name}
            onChange={(e: { target: { value: string } }) =>
              setValue("name", e.target.value)
            }
          />

          {/* Datas */}
          <div className="flex flex-col sm:grid grid-cols-2 gap-x-4">
            {/* Data de Início */}
            <div className="flex flex-col justify-content-center h-16 border pt-7 pl-4 rounded-md relative">
              <label
                className="absolute top-1 left-3 text-caption text-muted-foreground font-semibold"
                htmlFor="startDate"
              >
                Data de Início *
              </label>
              <Controller
                name="startDate"
                control={control}
                defaultValue={entity?.startDate || new Date()}
                render={({ field }) => (
                  <Calendar
                    appendTo="self"
                    id="startDate"
                    dateFormat="dd/mm/yy"
                    value={field.value}
                    onChange={(e) => field.onChange(e.value)}
                    className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                    readOnlyInput
                    placeholder="Selecione a data"
                  />
                )}
              />
              {errors.startDate && (
                <p className="text-destructive text-caption mt-1">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            {/* Data de Fim */}
            <div className="flex flex-col justify-content-center h-16 border pt-7 pl-4 rounded-md relative">
              <label
                className="absolute top-1 left-3 text-caption text-muted-foreground font-semibold"
                htmlFor="endDate"
              >
                Data de Fim *
              </label>
              <Controller
                name="endDate"
                control={control}
                defaultValue={entity?.endDate || new Date()}
                render={({ field }) => (
                  <Calendar
                    appendTo="self"
                    id="endDate"
                    dateFormat="dd/mm/yy"
                    value={field.value}
                    onChange={(e) => field.onChange(e.value)}
                    className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                    readOnlyInput
                    placeholder="Selecione a data"
                  />
                )}
              />
              {errors.endDate && (
                <p className="text-destructive text-caption mt-1">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button type="button" onClick={handleClose} variant="outlined">
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-periodo-letivo"
            variant="contained"
            color="primary"
          >
            {isEdit ? "Salvar Alterações" : "Criar Período Letivo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
