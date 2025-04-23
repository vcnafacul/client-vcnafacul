import DocxPreview from "@/components/atoms/docxPreview";
import { getFile } from "@/services/content/getFile";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ContentDtoInput } from "../../dtos/content/contentDtoInput";
import { StatusContent } from "../../enums/content/statusContent";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { DASH, ESTUDO } from "../../routes/path";
import { getContentOrder } from "../../services/content/getContent";
import { useAuthStore } from "../../store/auth";
import { MateriasLabel } from "../../types/content/materiasLabel";

function Subject() {
  const { id } = useParams();
  const {
    data: { token },
  } = useAuthStore();

  const [contents, setContents] = useState<ContentDtoInput[]>([]);
  const [nomeMateria, setNomeMateria] = useState("");
  const [contentSelected, setContentSelected] = useState<ContentDtoInput>();
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer>();
  const dataRef = useRef<ContentDtoInput[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (contentSelected) {
      getFile(contentSelected.file!.id, token).then((res) => {
        res.arrayBuffer().then(setArrayBuffer);
      });
    }
  }, [contentSelected, token]);

  useEffect(() => {
    getContentOrder(token, StatusEnum.Approved as unknown as StatusContent, id)
      .then((res) => {
        setContents(res);
        const idMateria = res[0].subject.frente.materia;
        const nomeMateria =
          MateriasLabel.find((m) => m.value === idMateria)?.label || "";
        setNomeMateria(
          nomeMateria
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9 ]/g, "")
        );
        dataRef.current = res;
        if (res.length > 0) setContentSelected(res[0]);
      })
      .catch((err) => toast.error(err.message));
  }, [id, token]);

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <h1 className="text-2xl font-bold text-gray-800">
            {contents[0]?.subject.name}
          </h1>
          <button
            className="text-gray-600 hover:text-black flex items-center gap-2 px-2 py-1"
            onClick={() => navigate(`${DASH}/${ESTUDO}/${nomeMateria}`)}
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Voltar</span>
          </button>
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Menu lateral */}
          <aside className="bg-white shadow-md rounded-lg p-4 w-full lg:w-80 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Conteúdos
            </h2>
            <nav className="space-y-2">
              {contents.map((content, index) => (
                <div
                  key={index}
                  onClick={() => setContentSelected(content)}
                  className={`cursor-pointer px-4 py-2 rounded transition-all ${
                    content.id === contentSelected?.id
                      ? "bg-gray-200 font-semibold"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {index + 1} - {content.title}
                </div>
              ))}
            </nav>
          </aside>

          {/* Preview do conteúdo */}
          <section className="bg-white shadow-md rounded-lg p-4 flex-1 overflow-x-auto">
            {contentSelected && arrayBuffer ? (
              <DocxPreview arrayBuffer={arrayBuffer} />
            ) : (
              <p className="text-gray-600">
                Selecione um conteúdo para visualizar.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Subject;
