/* eslint-disable @typescript-eslint/no-explicit-any */
import { cursos } from "@/utils/listOfCourses";
import { Checkbox } from "@mui/material";
import { useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { areas } from "../area";

interface Props {
  onSubmit: (areas: string[], cursos: string[]) => Promise<void>;
  back: (areas: string[], cursos: string[]) => void;
  selectedCourse: string[];
  selectedField: string[];
  processing: boolean;
}

export default function SendQuest({
  onSubmit,
  back,
  selectedCourse,
  selectedField,
  processing
}: Props) {
  const [areaInterest, setAreaInterest] = useState<string[]>(selectedField);
  const [selectedCursos, setSelectedCursos] =
    useState<string[]>(selectedCourse);
  const [selectedCurso, setSelectedCurso] = useState<string>("");

  const handleSelectCurso = (e: any) => {
    const curso = e.target.value as string;
    if (curso && !selectedCursos.includes(curso)) {
      setSelectedCursos([...selectedCursos, curso]);
    }
    setSelectedCurso(""); // Resetar o select após a seleção
  };

  const handleRemoveCurso = (cursoToRemove: string) => {
    setSelectedCursos(
      selectedCursos.filter((curso) => curso !== cursoToRemove)
    );
  };

  const handleSubmit = () => {
    onSubmit(areaInterest, selectedCursos)
  };

  const handleBack = () => {
    back(areaInterest, selectedCursos);
  };

  return (
    <div className="max-w-5xl w-full mx-auto p-6 space-y-8 bg-white shadow-md rounded-lg">
      {/* Áreas com mais dificuldades */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-emerald-600 border-l-4 border-emerald-500 pl-4">
          Áreas com mais dificuldades
        </h3>
        <p className="text-gray-600 text-sm">
          Nos ajude a entender melhor suas expectativas. Assinale abaixo as
          áreas onde acredita ter mais dificuldades.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {areas.map((area, index) => (
            <label
              key={index}
              className="flex items-center space-x-2 bg-gray-50 px-4 rounded-md shadow-sm"
            >
              <Checkbox
                checked={areaInterest.includes(area)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setAreaInterest([...areaInterest, area]);
                  } else {
                    setAreaInterest(
                      areaInterest.filter((item) => item !== area)
                    );
                  }
                }}
                color="primary"
              />
              <span className="text-gray-800">{area}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Cursos de Interesse */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-sky-600 border-l-4 border-sky-500 pl-4">
          Cursos de Interesse
        </h3>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <select
            value={selectedCurso}
            onChange={handleSelectCurso}
            className="w-full md:max-w-sm p-3 border border-gray-300 rounded-md self-start mt-4"
          >
            <option value="">Selecione um curso</option>
            {cursos.map((curso, index) => (
              <option key={index} value={curso}>
                {curso}
              </option>
            ))}
          </select>
          <div className="w-full p-2 rounded-lg h-60 overflow-y-auto scrollbar-hide mt-2">
            {selectedCursos.length > 0 ? (
              <ul className="space-y-2">
                {selectedCursos.map((curso, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-1 bg-gray-50 shadow-md"
                  >
                    <span className="text-gray-700">{curso}</span>
                    <IoCloseSharp
                      className="text-red-600 w-6 h-6 cursor-pointer"
                      onClick={() => handleRemoveCurso(curso)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Nenhum curso selecionado.</p>
            )}
          </div>
        </div>
      </section>

      {/* Botão de envio */}
      <div className="w-full flex justify-end gap-4">
        <button
          className="mt-8 px-6 py-3 text-white rounded font-medium disabled:bg-gray-400 bg-blue-600 w-60"
          onClick={handleBack}
          disabled={processing}
        >
          Voltar
        </button>
        <button
          className="mt-8 px-6 py-3  text-white rounded font-medium disabled:bg-gray-400 bg-blue-600 w-60"
          onClick={handleSubmit}
          disabled={processing}
        >
          {processing ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}
