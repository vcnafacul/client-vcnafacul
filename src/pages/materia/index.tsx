import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getImagePreset } from "../../config/materiaPresets";
import { CONTENT } from "../../routes/path";
import { getFrentesWithContent } from "../../services/content/getFrentes";
import { getMaterias, MateriaDto } from "../../services/content/getMaterias";
import { useAuthStore } from "../../store/auth";
import { Frente } from "../../types/content/frenteContent";
import { dataMateria } from "./data";

// ObjectId do MongoDB: 24 caracteres hexadecimais
function isObjectId(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(value);
}

function Materia() {
  const { nomeMateria } = useParams();
  const {
    data: { token },
  } = useAuthStore();
  const navigate = useNavigate();

  const [frentes, setFrentes] = useState<Frente[]>([]);
  const [frenteSelected, setFrenteSelected] = useState<Frente>();
  const [materiaInfo, setMateriaInfo] = useState<{
    nome: string;
    image?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  } | null>(null);

  useEffect(() => {
    if (!nomeMateria) return;

    if (isObjectId(nomeMateria)) {
      // Rota por ID: busca frentes direto pelo ID e resolve nome via getMaterias
      getMaterias(token)
        .then((materias) => {
          const materia = materias.find((m) => m._id === nomeMateria);
          if (materia) {
            const imageFromDb = getImagePreset(materia.image);
            const pageInfo = dataMateria[materia.nome];
            setMateriaInfo({
              nome: materia.nome,
              image: imageFromDb ?? pageInfo?.image,
            });
          }
          return getFrentesWithContent(nomeMateria, token);
        })
        .then((res) => {
          if (!res) {
            setFrentes([]);
            setFrenteSelected(undefined);
            return;
          }
          setFrentes(res);
          setFrenteSelected(res.length > 0 ? res[0] : undefined);
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    } else {
      // Rota por slug (fallback): resolve via mapeamento estático
      const pageInfo = dataMateria[nomeMateria];
      const tituloMateria = pageInfo?.label || "";
      setMateriaInfo({
        nome: tituloMateria,
        image: pageInfo?.image,
      });

      getMaterias(token)
        .then((materias) => {
          const materia = materias.find((m: MateriaDto) => m.nome === tituloMateria);
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
          setFrenteSelected(res.length > 0 ? res[0] : undefined);
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    }
  }, [nomeMateria, token]);

  const Icon = materiaInfo?.image;

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

  return (
    <div className="min-h-screen bg-gray-10 py-10 px-4">
      <div className="container mx-auto">
      {/* Header */}
      <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Explore o mundo da {materiaInfo?.nome || ""}
          </h1>
          <p className="text-gray-500 text-base">
            Escolha uma frente e um tema para começar seus estudos 🚀
          </p>
        </div>
        {Icon && <Icon className="w-[300px] h-[250px]" />}
      </div>

      {/* Conteúdo */}
      {getFrenteCards()}
      {getTemaCards()}
      </div>
    </div>
  );
}

export default Materia;
