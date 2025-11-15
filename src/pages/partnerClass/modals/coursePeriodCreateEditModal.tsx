import { InputFactory } from "@/components/organisms/inputFactory";
import ModalTemplate from "@/components/templates/modalTemplate";
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
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-4 rounded-md shadow-md"
    >
      <div className="w-[85vw] sm:w-[600px] flex flex-col gap-4">
        <h1 className="text-left text-marine text-3xl font-black">
          {isEdit ? "Editar Período Letivo" : "Novo Período Letivo"}
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
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
                className="absolute top-1 left-3 text-xs text-grey font-semibold"
                htmlFor="startDate"
              >
                Data de Início *
              </label>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <Calendar
                    id="startDate"
                    dateFormat="dd/mm/yy"
                    value={field.value}
                    onChange={(e) => field.onChange(e.value)}
                    className="focus-visible:ring-orange rounded-md"
                    readOnlyInput
                    placeholder="Selecione a data"
                  />
                )}
              />
              {errors.startDate && (
                <p className="text-red text-xs mt-1">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            {/* Data de Fim */}
            <div className="flex flex-col justify-content-center h-16 border pt-7 pl-4 rounded-md relative">
              <label
                className="absolute top-1 left-3 text-xs text-grey font-semibold"
                htmlFor="endDate"
              >
                Data de Fim *
              </label>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <Calendar
                    id="endDate"
                    dateFormat="dd/mm/yy"
                    value={field.value}
                    onChange={(e) => field.onChange(e.value)}
                    className="focus-visible:ring-orange rounded-md"
                    readOnlyInput
                    placeholder="Selecione a data"
                  />
                )}
              />
              {errors.endDate && (
                <p className="text-red text-xs mt-1">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              onClick={handleClose}
              variant="outlined"
              className="w-full"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className="w-full"
            >
              {isEdit ? "Salvar Alterações" : "Criar Período Letivo"}
            </Button>
          </div>
        </form>
      </div>
    </ModalTemplate>
  );
}
