/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from "@/components/molecules/button";
import { InputFactory } from "@/components/organisms/inputFactory";
import ModalTemplate from "@/components/templates/modalTemplate";
import { Inscription } from "@/types/partnerPrepCourse/inscription";
import { yupResolver } from "@hookform/resolvers/yup";
import { Calendar } from "primereact/calendar";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

export interface InscriptionOutput {
  id: string;
  name: string;
  openingsCount: number;
  description: string;
  range: Date[];
}

interface InscriptionInfoModalProps {
  isOpen: boolean;
  handleClose: () => void;
  inscription?: Inscription;
  onCreateEdit: (inscription: InscriptionOutput) => void;
}

export function InscriptionInfoCreateEditModal({
  isOpen,
  handleClose,
  inscription,
  onCreateEdit,
}: InscriptionInfoModalProps) {
  const schema = yup
    .object()
    .shape({
      name: yup
        .string()
        .default(inscription?.name)
        .required("Campo obrigatório"),
      openingsCount: yup
        .number()
        .min(1, "O número de vagas deve ser maior que 0")
        .default(inscription?.openingsCount)
        .required("Campo obrigatório"),
      description: yup.string().default(inscription?.description),
      range: yup
        .array()
        .of(yup.date().required("Data obrigatória"))
        .default([
          inscription?.startDate || new Date(),
          inscription?.endDate || new Date(),
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
    onCreateEdit({ ...data, id: inscription?.id });
  };

  useEffect(() => {
    register("name");
    register("openingsCount");
    register("description");
    register("range");
  }, []);

  return (
    <ModalTemplate isOpen={isOpen} handleClose={handleClose} className="bg-white p-2 rounded-md">
      <div className="w-96 sm:min-w-[585px] flex flex-col gap-1">
        <h1 className="text-left text-marine text-3xl font-black">
          Processo Seletivo
        </h1>
        <form
          className="sm:grid grid-cols-2 grid-rows-3 gap-x-4"
          onSubmit={handleSubmit(resolver)}
        >
          <div className="row-start-1 col-start-1">
            <InputFactory
              id="name"
              label="Titulo"
              type="text"
              defaultValue={inscription?.name}
              error={errors.name}
              onChange={(e: any) => setValue("name", e.target.value)}
            />
          </div>
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
              defaultValue={[
                new Date(inscription?.startDate || new Date()),
                new Date(inscription?.endDate || new Date()),
              ]}
              render={({ field }) => (
                <Calendar
                  id="range"
                  dateFormat="dd/mm/yy"
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  selectionMode="range"
                  className="focus-visible:ring-orange"
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
          <div className="row-start-2 col-start-1">
            <InputFactory
              id="openingsCount"
              label="Numero de Vagas"
              type="number"
              defaultValue={inscription?.openingsCount}
              error={errors.openingsCount}
              onChange={(e: any) =>
                setValue("openingsCount", parseInt(e.target.value))
              }
            />
          </div>
          <div className="row-span-3 row-start-1 col-start-2">
            <InputFactory
              id="description"
              label="Descrição"
              type="textarea"
              defaultValue={inscription?.description}
              onChange={(e: any) => setValue("description", e.target.value)}
            />
          </div>
          <div className="flex gap-4 justify-end col-span-2">
            <Button
              typeStyle="secondary"
              className="w-24 h-8"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button typeStyle="primary" className="w-24 h-8" type="submit">
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </ModalTemplate>
  );
}
