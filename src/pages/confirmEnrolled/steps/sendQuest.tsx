import { cursos } from "@/utils/listOfCourses";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { Field } from "@/components/ui/field";
import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "@/lib/toast";
import { areas } from "../area";

interface Props {
  onSubmit: (areas: string[], cursos: string[]) => Promise<void>;
  back: (areas: string[], cursos: string[]) => void;
  selectedCourse: string[];
  selectedField: string[];
  processing: boolean;
  photoDone: boolean;
}

export default function SendQuest({
  onSubmit,
  back,
  selectedCourse,
  selectedField,
  processing,
  photoDone,
}: Props) {
  const [areaInterest, setAreaInterest] = useState<string[]>(selectedField);
  const [selectedCursos, setSelectedCursos] =
    useState<string[]>(selectedCourse);

  const handleRemoveCurso = (cursoToRemove: string) => {
    setSelectedCursos(
      selectedCursos.filter((curso) => curso !== cursoToRemove)
    );
  };

  const handleSubmit = () => {
    if (areaInterest.length === 0) {
      toast.error("Selecione pelo menos uma área com mais dificuldades.");
      return;
    }
    if (selectedCursos.length === 0) {
      toast.error("Selecione pelo menos um curso de interesse.");
      return;
    }
    onSubmit(areaInterest, selectedCursos);
  };

  const handleBack = () => {
    back(areaInterest, selectedCursos);
  };

  return (
    <div className="max-w-5xl w-full mx-auto p-6 space-y-8 bg-white shadow-md rounded-lg">
      {/* Áreas com mais dificuldades */}
      <section className="space-y-4">
        <h3 id="titulo-areas" className="text-h3 font-semibold text-success border-l-4 border-success pl-4">
          Áreas com mais dificuldades
        </h3>
        <p className="text-muted-foreground text-body">
          Nos ajude a entender melhor suas expectativas. Assinale abaixo as
          áreas onde acredita ter mais dificuldades.
        </p>
        <div
          role="group"
          aria-labelledby="titulo-areas"
          className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4"
        >
          {areas.map((area, index) => (
            <div
              key={index}
              className="bg-page px-4 rounded-md shadow-sm"
            >
              <Checkbox
                label={area}
                checked={areaInterest.includes(area)}
                onCheckedChange={(checked) => {
                  if (checked === true) {
                    setAreaInterest([...areaInterest, area]);
                  } else {
                    setAreaInterest(
                      areaInterest.filter((item) => item !== area)
                    );
                  }
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Cursos de Interesse */}
      <section className="space-y-4">
        <h3 className="text-h3 font-semibold text-foreground border-l-4 border-info pl-4">
          Cursos de Interesse
        </h3>
        <div className="flex flex-col md:flex-row items-start gap-4">
          <Field
            label="Digite para buscar um curso"
            className="w-full md:max-w-sm self-start"
          >
            <Combobox
              options={cursos.map((c) => ({ value: c, label: c }))}
              value={undefined}
              onValueChange={(newValue) => {
                if (newValue && !selectedCursos.includes(newValue)) {
                  setSelectedCursos([...selectedCursos, newValue]);
                }
              }}
              placeholder="Ex: Medicina, Engenharia..."
              emptyText="Nenhum curso encontrado"
            />
          </Field>
          <div className="w-full p-2 rounded-lg h-60 overflow-y-auto scrollbar-hide">
            {selectedCursos.length > 0 ? (
              <ul className="space-y-2">
                {selectedCursos.map((curso, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-1 bg-page shadow-md rounded-sm"
                  >
                    <span className="text-foreground">{curso}</span>
                    <button
                      type="button"
                      aria-label={`Remover ${curso}`}
                      className="text-destructive hover:text-destructive/80 transition-colors"
                      onClick={() => handleRemoveCurso(curso)}
                    >
                      <X aria-hidden="true" className="w-6 h-6" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-body">Nenhum curso selecionado.</p>
            )}
          </div>
        </div>
      </section>

      {/* Botão de envio */}
      <div className="w-full flex justify-end gap-4">
        {!photoDone && (
          <button
            className="mt-8 px-6 py-3 text-primary-foreground rounded-sm font-medium disabled:bg-muted disabled:text-muted-foreground bg-primary w-60"
            onClick={handleBack}
            disabled={processing}
          >
            Voltar
          </button>
        )}
        <button
          className="mt-8 px-6 py-3  text-primary-foreground rounded-sm font-medium disabled:bg-muted disabled:text-muted-foreground bg-primary w-60"
          onClick={handleSubmit}
          disabled={processing}
        >
          {processing ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}
