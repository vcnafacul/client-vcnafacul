import { InputFactory } from "@/components/organisms/inputFactory";
import { Button } from "@/components/ui/button";
import { iconPresets, imagePresets } from "@/config/materiaPresets";
import { MateriaDto } from "@/services/content/getMaterias";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import ModalTemplate, {
  ModalProps,
} from "../../../components/templates/modalTemplate";

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
  presets: Record<string, React.FunctionComponent<React.SVGProps<SVGSVGElement>>>;
  selected: string;
  onSelect: (key: string) => void;
  size?: string;
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {Object.entries(presets).map(([key, Svg]) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          className={`flex flex-col items-center p-2 rounded-md border-2 transition-all cursor-pointer ${
            selected === key
              ? "border-orange bg-orange/10"
              : "border-gray-200 hover:border-gray-400"
          }`}
        >
          <Svg className={size} />
          <span className="text-[10px] text-gray-500 mt-1 truncate max-w-full">
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
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose!}
      className="bg-white w-full max-w-2xl p-6 rounded-md max-h-[90vh] overflow-y-auto"
    >
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        {materia ? "Editar Matéria" : "Criar Nova Matéria"}
      </h2>
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
        <InputFactory
          id="nome"
          type="text"
          label="Nome"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => setValue("nome", e.target.value)}
          error={errors.nome}
          defaultValue={materia?.nome}
        />

        <InputFactory
          id="enemArea"
          type="select"
          label="Área ENEM"
          options={enemAreaOptions}
          defaultValue={materia?.enemArea ?? "Linguagens"}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => setValue("enemArea", e.target.value ?? e.value)}
        />

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Ícone do Menu
          </label>
          <PresetGrid
            presets={iconPresets}
            selected={selectedIcon}
            onSelect={(key) => setValue("icon", key)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Imagem da Página
          </label>
          <PresetGrid
            presets={imagePresets}
            selected={selectedImage}
            onSelect={(key) => setValue("image", key)}
            size="w-16 h-16"
          />
        </div>

        <div className="flex justify-end">
          <Button
            variant="default"
            className="bg-orange hover:bg-orange/80"
            type="submit"
          >
            {materia ? "Salvar" : "Criar"}
          </Button>
        </div>
      </form>
    </ModalTemplate>
  );
}

export default ManagerMateria;
