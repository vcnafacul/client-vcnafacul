import { Field, FormLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
    defaultValues: {
      name: entity?.name || "",
      startDate: entity?.startDate
        ? entity.startDate instanceof Date
          ? entity.startDate
          : new Date(entity.startDate)
        : new Date(),
      endDate: entity?.endDate
        ? entity.endDate instanceof Date
          ? entity.endDate
          : new Date(entity.endDate)
        : new Date(),
    },
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
      console.log("Entity no modal:", entity);
      console.log("StartDate:", entity?.startDate, typeof entity?.startDate);
      console.log("EndDate:", entity?.endDate, typeof entity?.endDate);

      const startDate = entity?.startDate
        ? entity.startDate instanceof Date
          ? entity.startDate
          : new Date(entity.startDate)
        : new Date();

      const endDate = entity?.endDate
        ? entity.endDate instanceof Date
          ? entity.endDate
          : new Date(entity.endDate)
        : new Date();

      console.log("StartDate processada:", startDate);
      console.log("EndDate processada:", endDate);

      reset({
        name: entity?.name || "",
        startDate: startDate,
        endDate: endDate,
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
          noValidate
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormLegend />
          {/* Nome do Período */}
          <Field label="Nome do Período" required error={errors.name?.message}>
            <Input
              id="name"
              type="text"
              placeholder="Ex: 1º Semestre 2024"
              defaultValue={entity?.name}
              onChange={(e) => setValue("name", e.target.value)}
            />
          </Field>

          {/* Datas */}
          <div className="flex flex-col gap-4 sm:grid grid-cols-2">
            {/* Data de Início */}
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <Field
                  label="Data de Início"
                  required
                  error={errors.startDate?.message}
                >
                  <DatePicker
                    value={field.value ? new Date(field.value) : undefined}
                    onChange={(d) => d && field.onChange(d)}
                    placeholder="Selecione a data"
                  />
                </Field>
              )}
            />

            {/* Data de Fim */}
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <Field
                  label="Data de Fim"
                  required
                  error={errors.endDate?.message}
                >
                  <DatePicker
                    value={field.value ? new Date(field.value) : undefined}
                    onChange={(d) => d && field.onChange(d)}
                    placeholder="Selecione a data"
                  />
                </Field>
              )}
            />
          </div>
        </form>

        <DialogFooter>
          <Button type="button" onClick={handleClose} variant="outline">
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-periodo-letivo"
          >
            {isEdit ? "Salvar Alterações" : "Criar Período Letivo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
