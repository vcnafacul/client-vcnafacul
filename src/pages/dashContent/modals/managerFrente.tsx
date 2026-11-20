import { Field, FormLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FrenteDto } from "@/dtos/content/contentDtoInput";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import PropValue from "../../../components/molecules/PropValue";
import type { SelectOption } from "@/components/ui/options-select";
import { ModalProps } from "@/types/modal";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreateFrenteDtoInput,
  UpdateFrenteDto,
} from "../../../dtos/content/frenteDto";

interface Props extends ModalProps {
  materia: SelectOption;
  frente?: FrenteDto | null;
  newFrente: (frente: CreateFrenteDtoInput) => Promise<void>;
  editFrente: (frente: UpdateFrenteDto) => Promise<void>;
  isOpen: boolean;
}

function ManagerFrente({
  handleClose,
  materia,
  frente,
  newFrente,
  editFrente,
  isOpen,
}: Props) {
  const schema = yup
    .object()
    .shape({
      name: yup.string().required("Você precisa definir um Título"),
    })
    .required();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    register("name");
  }, [register]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const create = (data: any) => {
    const body: CreateFrenteDtoInput = {
      name: data.name,
      materia: materia.value as string,
    };
    newFrente(body).then(() => handleClose!());
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const edit = (data: any) => {
    const body: UpdateFrenteDto = {
      id: frente!.id,
      name: data.name,
    };
    editFrente(body).then(() => handleClose!());
  };

  useEffect(() => {
    if (frente) {
      setValue("name", frente.nome);
    }
  }, [frente, setValue]);

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose?.()}>
      <DialogContent size="md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{frente ? "Editar frente" : "Criar frente"}</DialogTitle>
        </DialogHeader>
        <DialogBody className="-mx-1 px-1 pt-2">
          <form
            id="form-manager-frente"
            onSubmit={handleSubmit(frente ? edit : create)}
            noValidate
            className="flex flex-col gap-4"
          >
            <PropValue prop="Materia" value={materia.label} />
            <FormLegend />
            <Field label="Nome" required error={errors.name?.message}>
              <Input
                id="name"
                type="text"
                defaultValue={frente?.nome}
                onChange={(e) => setValue("name", e.target.value)}
              />
            </Field>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button type="submit" form="form-manager-frente">
            {frente ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ManagerFrente;
