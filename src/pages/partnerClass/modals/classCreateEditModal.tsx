/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from "@/components/molecules/button";
import { InputFactory } from "@/components/organisms/inputFactory";
import ModalTemplate from "@/components/templates/modalTemplate";
import { ClassEntityOutput } from "@/dtos/classes/classOutput";
import { ClassEntity } from "@/types/partnerPrepCourse/classEntity";
import { yupResolver } from "@hookform/resolvers/yup";
import { Calendar } from "primereact/calendar";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

interface ClassModalProps {
  isOpen: boolean;
  handleClose: () => void;
  entity?: ClassEntity;
  onCreateEdit: (entity: ClassEntityOutput) => void;
}

export function ClassCreateEditModal({
  isOpen,
  handleClose,
  entity,
  onCreateEdit,
}: ClassModalProps) {
  const schema = yup
    .object()
    .shape({
      name: yup.string().default(entity?.name).required("Campo obrigatório"),
      description: yup.string().default(entity?.description),
      range: yup
        .array()
        .of(yup.date().required("Data obrigatória"))
        .default([
          entity?.startDate || new Date(),
          entity?.endDate || new Date(),
        ])
        .length(2, "Selecione um intervalo de datas válido")
        .required("Campo obrigatório"), // Validando o array de datas com duas posições
    })
    .required();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolver = (data: any) => {
    onCreateEdit({
      ...data,
      id: entity?.id,
      year: new Date(data.range[0]).getFullYear(),
    });
  };

  useEffect(() => {
    register("name");
    register("description");
    register("range");
  }, []);

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-4 rounded-md shadow-md"
    >
      <div className="w-[85vw] sm:w-[600px] flex flex-col gap-4">
        <h1 className="text-left text-marine text-3xl font-black">Turmas</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(resolver)}>
          {/* Linha 1: Nome e Data */}
          <div className="flex flex-col sm:grid grid-cols-2 gap-x-4">
            <InputFactory
              id="name"
              label="Título"
              type="text"
              defaultValue={entity?.name}
              error={errors.name}
              onChange={(e: { target: { value: string } }) =>
                setValue("name", e.target.value)
              }
            />
            <div className="flex flex-col justify-content-center h-16 border pt-7 pl-4 rounded-md relative">
              <label
                className="absolute top-1 left-3 text-xs text-grey font-semibold"
                htmlFor="date"
              >
                Inicio - Fim
              </label>
              <Controller
                name="range"
                control={control}
                defaultValue={[
                  new Date(entity?.startDate || new Date()),
                  new Date(entity?.endDate || new Date()),
                ]}
                render={({ field }) => (
                  <Calendar
                    id="range"
                    dateFormat="dd/mm/yy"
                    value={field.value}
                    onChange={(e) => field.onChange(e.value)}
                    selectionMode="range"
                    className="focus-visible:ring-orange rounded-md"
                    readOnlyInput
                    hideOnRangeSelection
                  />
                )}
              />
              {errors.range && (
                <p className="text-red text-xs mt-1">{errors.range.message}</p>
              )}
            </div>
          </div>
          {/* Linha 2: Descrição */}
          <InputFactory
            id="description"
            label="Descrição"
            type="textarea"
            defaultValue={entity?.description}
            onChange={(e: { target: { value: string | undefined } }) =>
              setValue("description", e.target.value)
            }
            rows={5}
          />
          {/* Botões */}
          <div className="flex justify-end gap-4">
            <Button
              typeStyle="secondary"
              className="w-24 h-10 border border-orange text-orange"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              typeStyle="primary"
              className="w-24 h-10 bg-orange text-white"
              type="submit"
            >
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </ModalTemplate>
  );
}
