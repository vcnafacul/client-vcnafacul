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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface InscriptionOutput {
  id: string;
  name: string;
  openingsCount: number;
  description: string;
  range: Date[];
  requestDocuments: boolean;
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
      name: yup.string().required("Campo obrigatório"),
      openingsCount: yup
        .number()
        .min(1, "O número de vagas deve ser maior que 0")
        .required("Campo obrigatório"),
      description: yup.string(),
      range: yup
        .array()
        .of(yup.date().required("Data obrigatória"))
        .length(2, "Selecione um intervalo de datas válido")
        .required("Campo obrigatório"),
      requestDocuments: yup.boolean().default(false),
    })
    .required();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: inscription?.name || "",
      openingsCount: inscription?.openingsCount || 1,
      description: inscription?.description || "",
      range: [
        inscription?.startDate ? new Date(inscription.startDate) : new Date(),
        inscription?.endDate ? new Date(inscription.endDate) : new Date(),
      ],
      requestDocuments: inscription?.requestDocuments ?? false,
    },
  });

  const resolver = (data: any) => {
    onCreateEdit({ ...data, id: inscription?.id });
  };

  useEffect(() => {
    register("name");
    register("openingsCount");
    register("description");
    register("range");
    register("requestDocuments");
  }, []);

  return (
    <ModalTemplate isOpen={isOpen} handleClose={handleClose} className="bg-white p-6 rounded-md">
      <div className="sm:min-w-[640px] flex flex-col gap-6">
        <h1 className="text-marine text-2xl font-bold">Processo Seletivo</h1>

        <form className="grid grid-cols-1 sm:grid-cols-2 gap-6" onSubmit={handleSubmit(resolver)}>
          <InputFactory
            id="name"
            label="Título"
            type="text"
            defaultValue={inscription?.name}
            error={errors.name}
            onChange={(e: any) => setValue("name", e.target.value)}
          />

          <InputFactory
            id="openingsCount"
            label="Número de Vagas"
            type="number"
            defaultValue={inscription?.openingsCount}
            error={errors.openingsCount}
            onChange={(e: any) => setValue("openingsCount", parseInt(e.target.value))}
          />

          <div className="sm:col-span-2">
            <InputFactory
              id="description"
              label="Descrição"
              type="textarea"
              defaultValue={inscription?.description}
              onChange={(e: any) => setValue("description", e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="range" className="text-sm text-gray-700 font-semibold block mb-1">
              Período de Inscrição
            </Label>
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
                  readOnlyInput
                  hideOnRangeSelection
                  className="w-full"
                />
              )}
            />
            {errors.range && <p className="text-red text-xs mt-1">{errors.range.message}</p>}
          </div>

          <div className="sm:col-span-2 flex items-center gap-2">
            <Checkbox
              id="requestDocuments"
              checked={watch("requestDocuments")}
              onCheckedChange={(checked) => setValue("requestDocuments", !!checked)}
            />
            <Label htmlFor="requestDocuments" className="text-sm text-gray-700">
              Este processo seletivo exigirá envio de documentos dos candidatos
            </Label>
          </div>

          <div className="flex justify-end gap-4 sm:col-span-2 mt-2">
            <Button typeStyle="secondary" className="w-24 h-9" onClick={handleClose}>
              Cancelar
            </Button>
            <Button typeStyle="primary" className="w-24 h-9" type="submit">
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </ModalTemplate>
  );
}
