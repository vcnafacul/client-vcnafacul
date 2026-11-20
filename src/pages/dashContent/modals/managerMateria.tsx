import { SelectOpcoes } from "@/components/formulario/select-opcoes";
import { Field, FormLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { iconPresets, imagePresets } from "@/config/materiaPresets";
import { MateriaDto } from "@/services/content/getMaterias";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ModalProps } from "@/types/modal";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const enemAreaOptions = [
  { value: "Linguagens", label: "Linguagens" },
  { value: "Ciências Humanas", label: "Ciências Humanas" },
  { value: "Ciências da Natureza", label: "Ciências da Natureza" },
  { value: "Matemática", label: "Matemática" },
];

interface FormData {
  nome: string;
  enemArea: string;
  icon: string;
  image: string;
}

interface Props extends ModalProps {
  materia?: MateriaDto | null;
  onSubmit: (data: FormData) => Promise<void>;
  isOpen: boolean;
}

const schema = yup.object().shape({
  nome: yup.string().required("Nome é obrigatório"),
  enemArea: yup.string().required("Área ENEM é obrigatória"),
  icon: yup.string().default(""),
  image: yup.string().default(""),
});

function PresetGrid({
  presets,
  selected,
  onSelect,
  size = "w-12 h-12",
}: {
  presets: Record<
    string,
    React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  >;
  selected: string;
  onSelect: (key: string) => void;
  size?: string;
}) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
      {Object.entries(presets).map(([key, Svg]) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          className={`flex flex-col items-center p-2 rounded-md border-2 transition-all cursor-pointer ${
            selected === key
              ? "border-cta bg-cta/10"
              : "border-border hover:border-input"
          }`}
        >
          <Svg className={size} />
          <span className="text-caption text-muted-foreground mt-1 truncate max-w-full">
            {key}
          </span>
        </button>
      ))}
    </div>
  );
}

function ManagerMateria({ handleClose, materia, onSubmit, isOpen }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      nome: materia?.nome ?? "",
      enemArea: materia?.enemArea ?? "Linguagens",
      icon: materia?.icon ?? "",
      image: materia?.image ?? "",
    },
  });

  const selectedIcon = watch("icon");
  const selectedImage = watch("image");
  const enemArea = watch("enemArea");

  useEffect(() => {
    register("nome");
    register("enemArea");
    register("icon");
    register("image");
  }, [register]);

  useEffect(() => {
    if (materia) {
      setValue("nome", materia.nome);
      setValue("enemArea", materia.enemArea);
      setValue("icon", materia.icon ?? "");
      setValue("image", materia.image ?? "");
    }
  }, [materia, setValue]);

  const submit = (data: FormData) => {
    onSubmit(data).then(() => handleClose!());
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose?.()}>
      <DialogContent size="lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            {materia ? "Editar Matéria" : "Criar Nova Matéria"}
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="-mx-1 px-1 pt-2">
          <form
            id="form-manager-materia"
            onSubmit={handleSubmit(submit)}
            noValidate
            className="flex flex-col gap-4"
          >
            <FormLegend />
            <Field label="Nome" required error={errors.nome?.message}>
              <Input
                id="nome"
                type="text"
                defaultValue={materia?.nome}
                onChange={(e) => setValue("nome", e.target.value)}
              />
            </Field>

            <Field label="Área ENEM" required error={errors.enemArea?.message}>
              <SelectOpcoes
                id="enemArea"
                options={enemAreaOptions}
                value={enemArea}
                onValueChange={(valor) => setValue("enemArea", valor)}
              />
            </Field>

            <div>
              <p className="text-body font-medium text-foreground mb-2 block">
                Ícone do Menu
              </p>
              <PresetGrid
                presets={iconPresets}
                selected={selectedIcon}
                onSelect={(key) => setValue("icon", key)}
              />
            </div>

            <div>
              <p className="text-body font-medium text-foreground mb-2 block">
                Imagem da Página
              </p>
              <PresetGrid
                presets={imagePresets}
                selected={selectedImage}
                onSelect={(key) => setValue("image", key)}
                size="w-16 h-16"
              />
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button type="submit" form="form-manager-materia">
            {materia ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ManagerMateria;
