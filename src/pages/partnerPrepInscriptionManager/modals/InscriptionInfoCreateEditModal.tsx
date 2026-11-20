/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { InputFactory } from "@/components/organisms/inputFactory";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  isTest: boolean;
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
  const isEdit = !!inscription;

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
      isTest: yup.boolean().default(true),
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
      isTest: inscription?.isTest ?? true,
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
    register("isTest");
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        size="lg"
        aria-describedby={undefined}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Processo Seletivo</DialogTitle>
        </DialogHeader>

        <form
          id="form-processo-seletivo"
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          onSubmit={handleSubmit(resolver)}
        >
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
            onChange={(e: any) =>
              setValue("openingsCount", parseInt(e.target.value))
            }
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
            <Label
              htmlFor="range"
              className="text-body text-foreground font-semibold block mb-1"
            >
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
                  appendTo="self"
                  className="w-full"
                />
              )}
            />
            {errors.range && (
              <p className="text-destructive text-caption mt-1">{errors.range.message}</p>
            )}
          </div>

          <div className="sm:col-span-2 flex items-center gap-2">
            <Checkbox
              id="requestDocuments"
              checked={watch("requestDocuments")}
              onCheckedChange={(checked) =>
                setValue("requestDocuments", !!checked)
              }
            />
            <Label htmlFor="requestDocuments" className="text-body text-foreground">
              Este processo seletivo exigirá envio de documentos dos candidatos
            </Label>
          </div>

          {!isEdit && (
            <div className="sm:col-span-2 flex items-center gap-2">
              <Checkbox
                id="isTest"
                checked={watch("isTest")}
                onCheckedChange={(checked) => setValue("isTest", !!checked)}
              />
              <Label htmlFor="isTest" className="text-body text-foreground">
                Este é um processo seletivo de teste e não deve ser considerado
                válido
              </Label>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="form-processo-seletivo"
          >
            {isEdit ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
