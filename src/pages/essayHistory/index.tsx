import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/auth";
import { Essay } from "@/dtos/essay";
import { getMyEssays } from "@/services/essay";
import { ESSAY_WRITE } from "@/routes/path";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  SUBMITTED: "Processando",
  AI_REVIEWED: "Corrigida",
  AI_FAILED: "Erro na correção",
};

export default function EssayHistory() {
  const navigate = useNavigate();
  const { data: { token } } = useAuthStore();
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyEssays(token, 1, 50)
      .then((res) => setEssays(res.data))
      .catch(() => toast.error("Erro ao carregar redações"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="p-6 text-center">Carregando...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-marine mb-6">
        Minhas Redações
      </h1>
      {essays.length === 0 ? (
        <p className="text-grey text-center">
          Você ainda não escreveu nenhuma redação.
        </p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 text-sm font-semibold text-grey">Tema</th>
                <th className="text-left p-3 text-sm font-semibold text-grey">Nota IA</th>
                <th className="text-left p-3 text-sm font-semibold text-grey">Status</th>
                <th className="text-left p-3 text-sm font-semibold text-grey">Data</th>
              </tr>
            </thead>
            <tbody>
              {essays.map((essay) => (
                <tr
                  key={essay.id}
                  onClick={() =>
                    navigate(`/dashboard/${ESSAY_WRITE}/${essay.id}`)
                  }
                  className="border-t hover:bg-gray-50 cursor-pointer"
                >
                  <td className="p-3 text-sm">{essay.theme.title}</td>
                  <td className="p-3 text-sm font-bold text-marine">
                    {essay.aiReview ? essay.aiReview.totalScore : "-"}
                  </td>
                  <td className="p-3 text-sm">
                    {STATUS_LABELS[essay.status] ?? essay.status}
                  </td>
                  <td className="p-3 text-sm text-grey">
                    {essay.submittedAt
                      ? new Date(essay.submittedAt).toLocaleDateString("pt-BR")
                      : new Date(essay.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
