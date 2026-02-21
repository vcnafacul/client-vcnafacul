import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { CONTENT } from "../../routes/path";
import { getFrentesWithContent } from "../../services/content/getFrentes";
import { getMaterias } from "../../services/content/getMaterias";
import { useAuthStore } from "../../store/auth";
import { Frente } from "../../types/content/frenteContent";
import { MateriasLabel } from "../../types/content/materiasLabel";
import { DataMateriaProps, dataMateria } from "./data";

function Materia() {
  const { nomeMateria } = useParams();
  const {
    data: { token },
  } = useAuthStore();
  const navigate = useNavigate();

  const [frentes, setFrentes] = useState<Frente[]>([]);
  const [frenteSelected, setFrenteSelected] = useState<Frente>();

  const materiaPageInfo = dataMateria[nomeMateria as keyof DataMateriaProps];
  const Icon = materiaPageInfo.image;

  const tituloMateria =
    MateriasLabel.find((e) => e.value === materiaPageInfo.id)?.label || "";

  const getFrenteCards = useCallback(() => {
    if (frentes.length === 0) return null;
    return (
      <section className="mt-10">
        <span className="text-xl font-semibold text-gray-700 mb-4 block">
          Escolha uma frente:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {frentes.map((frente) => {
            const frenteId = frente._id || frente.id;
            return (
              <div
                key={frenteId}
                onClick={() => setFrenteSelected(frente)}
                className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-lg shadow-sm ${
                  frenteId === (frenteSelected?._id || frenteSelected?.id)
                    ? "border-blue-500 bg-blue-50"
                    : "bg-white"
                }`}
              >
                <div className="bg-blue-100 text-blue-700 font-bold w-10 h-10 rounded-full flex items-center justify-center">
                  {frente.nome.charAt(0)}
                </div>
                <div>
                  <p className="text-md font-medium text-gray-800">
                    {frente.nome}
                  </p>
                  <p className="text-sm text-gray-500">
                    Clique para ver os temas
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }, [frentes, frenteSelected]);

  const getTemaCards = useCallback(() => {
    if (!frenteSelected) return null;
    return (
      <section className="mt-10">
        <span className="text-xl font-semibold text-gray-700 mb-4 block">
          Temas disponíveis:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {frenteSelected.subjects.map((subject) => {
            const subjectId = (subject as any)._id || subject.id;
            return (
              <div
                key={subjectId}
                onClick={() =>
                  navigate(
                    `/dashboard/${CONTENT}/${subject.name.replace(" ", "")}/${subjectId}`
                  )
                }
                className="flex items-center gap-4 bg-white hover:bg-orange-50 p-4 rounded-lg cursor-pointer shadow-md border transition"
              >
                <div className="bg-orange-200 text-orange-700 font-bold w-10 h-10 rounded-full flex items-center justify-center">
                  {subject.name.charAt(0)}
                </div>
                <div>
                  <p className="text-md font-medium text-gray-800">
                    {subject.name}
                  </p>
                  <p className="text-sm text-gray-500">Clique para estudar</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }, [frenteSelected]);

  useEffect(() => {
    getMaterias(token)
      .then((materias) => {
        const materia = materias.find((m) => m.nome === tituloMateria);
        if (!materia) {
          toast.error(`Matéria "${tituloMateria}" não encontrada`);
          return;
        }
        return getFrentesWithContent(materia._id, token);
      })
      .then((res) => {
        if (!res) {
          setFrentes([]);
          setFrenteSelected(undefined);
          return;
        }
        setFrentes(res);
        if (res.length > 0) {
          setFrenteSelected(res[0]);
        } else {
          setFrenteSelected(undefined);
        }
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  }, [tituloMateria, nomeMateria, token]);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 container mx-auto">
      {/* Header */}
      <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Explore o mundo da {tituloMateria}
          </h1>
          <p className="text-gray-500 text-base">
            Escolha uma frente e um tema para começar seus estudos 🚀
          </p>
        </div>
        <Icon className="w-[300px] h-[250px]" />
      </div>

      {/* Conteúdo */}
      {getFrenteCards()}
      {getTemaCards()}
    </div>
  );
}

export default Materia;
