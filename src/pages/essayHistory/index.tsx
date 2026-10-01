import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/auth";
import { Essay, EssayStats } from "@/dtos/essay";
import { getMyEssays, getMyStats } from "@/services/essay";
import { ESSAY_WRITE } from "@/routes/path";
import ScoreEvolutionChart from "./ScoreEvolutionChart";
import CompetencyRadarChart from "./CompetencyRadarChart";
import CompetencyEvolutionChart from "./CompetencyEvolutionChart";
import { useAcimaDeSm } from "@/components/dashV2/useAcimaDeSm";
import { notaDaRedacao } from "./notaDaRedacao";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  SUBMITTED: "Aguardando revisão",
  REVIEWED: "Corrigida",
};

const dataDaRedacao = (essay: Essay) =>
  new Date(essay.submittedAt ?? essay.createdAt).toLocaleDateString("pt-BR");

const tipoDaRedacao = (essay: Essay) =>
  essay.inputType === "UPLOADED" ? "📷" : "✍️";

export default function EssayHistory() {
  const navigate = useNavigate();
  const { data: { token } } = useAuthStore();
  const [essays, setEssays] = useState<Essay[]>([]);
  const [stats, setStats] = useState<EssayStats | null>(null);
  const [loading, setLoading] = useState(true);
  // Abaixo de 768px (o `sm` do projeto) a tabela vira cards.
  const acimaDeSm = useAcimaDeSm();

  useEffect(() => {
    Promise.all([
      getMyEssays(token, 1, 50).then((res) => setEssays(res.data)),
      getMyStats(token).then(setStats).catch(() => {}),
    ])
      .catch(() => toast.error("Erro ao carregar redações"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="p-4 sm:p-6 text-center">Carregando...</div>;

  const abrir = (essay: Essay) =>
    navigate(`/dashboard/${ESSAY_WRITE}/${essay.id}`);

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-marine mb-6">
        Minhas Redações
      </h1>

      {stats && stats.timeline.filter((e) => e.aiReview || e.humanReview).length >= 2 ? (
        <div className="space-y-6 mb-8">
          <ScoreEvolutionChart timeline={stats.timeline} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CompetencyRadarChart timeline={stats.timeline} />
            <CompetencyEvolutionChart timeline={stats.timeline} />
          </div>
        </div>
      ) : stats && stats.timeline.length > 0 ? (
        <p className="text-grey text-center mb-6">
          Envie mais redações para ver sua evolução.
        </p>
      ) : null}

      {essays.length === 0 ? (
        <p className="text-grey text-center">
          Você ainda não escreveu nenhuma redação.
        </p>
      ) : !acimaDeSm ? (
        <ul className="flex flex-col gap-2">
          {essays.map((essay) => {
            const nota = notaDaRedacao(essay);
            return (
              <li key={essay.id}>
                <button
                  type="button"
                  onClick={() => abrir(essay)}
                  className="w-full border rounded-lg p-3 text-left bg-white hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-sm break-words min-w-0">
                      <span aria-hidden className="mr-1">
                        {tipoDaRedacao(essay)}
                      </span>
                      {essay.theme.title}
                    </p>
                    <span className="shrink-0 text-lg font-bold text-marine">
                      {nota ?? "-"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-grey">
                    {STATUS_LABELS[essay.status] ?? essay.status} ·{" "}
                    {dataDaRedacao(essay)}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 text-sm font-semibold text-grey">Tema</th>
                <th className="text-left p-3 text-sm font-semibold text-grey">Tipo</th>
                <th className="text-left p-3 text-sm font-semibold text-grey">Nota</th>
                <th className="text-left p-3 text-sm font-semibold text-grey">Status</th>
                <th className="text-left p-3 text-sm font-semibold text-grey">Data</th>
              </tr>
            </thead>
            <tbody>
              {essays.map((essay) => (
                <tr
                  key={essay.id}
                  onClick={() => abrir(essay)}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                >
                  <td className="p-3 text-sm">{essay.theme.title}</td>
                  <td className="p-3 text-sm text-center">
                    {tipoDaRedacao(essay)}
                  </td>
                  <td className="p-3 text-sm font-bold text-marine">
                    {notaDaRedacao(essay) ?? "-"}
                  </td>
                  <td className="p-3 text-sm">
                    {STATUS_LABELS[essay.status] ?? essay.status}
                  </td>
                  <td className="p-3 text-sm text-grey">
                    {dataDaRedacao(essay)}
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
