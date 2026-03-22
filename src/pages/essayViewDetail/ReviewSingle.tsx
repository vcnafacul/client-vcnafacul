import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiCpu, FiUser } from "react-icons/fi";
import { useAuthStore } from "@/store/auth";
import { EssayReview } from "@/dtos/essay";
import { getEssayReviews } from "@/services/essay";
import ScoreOverview from "../essayResult/ScoreOverview";
import CompetencyDetail from "../essayResult/CompetencyDetail";

export default function ReviewSingle() {
  const { id, reviewId } = useParams<{ id: string; reviewId: string }>();
  const navigate = useNavigate();
  const { data: { token } } = useAuthStore();
  const [review, setReview] = useState<EssayReview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !reviewId) return;
    getEssayReviews(token, id)
      .then((reviews) => {
        const found = reviews.find((r: EssayReview) => r.id === reviewId);
        setReview(found ?? null);
      })
      .catch(() => toast.error("Erro ao carregar revisão"))
      .finally(() => setLoading(false));
  }, [id, reviewId, token]);

  if (loading) return <div className="p-6 text-center">Carregando...</div>;
  if (!review) return <div className="p-6 text-center">Revisão não encontrada</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="text-marine">
          {review.reviewType === "AI" ? (
            <FiCpu className="h-6 w-6" />
          ) : (
            <FiUser className="h-6 w-6" />
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-marine">
            {review.reviewType === "AI"
              ? "Correção por IA"
              : `Revisão de ${review.reviewer?.firstName ?? ""} ${review.reviewer?.lastName ?? ""}`}
          </h1>
          <p className="text-sm text-grey">
            {review.reviewType === "AI" ? "Inteligência Artificial" : "Revisão Humana"}
            {" · "}
            {new Date(review.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      <ScoreOverview review={review} />

      <div className="space-y-4">
        <h3 className="text-md font-bold">Detalhamento por Competência</h3>
        {[1, 2, 3, 4, 5].map((n) => (
          <CompetencyDetail
            key={n}
            number={n}
            score={review[`comp${n}Score` as keyof typeof review] as number}
            feedback={review[`comp${n}Feedback` as keyof typeof review] as string}
            suggestion={review[`comp${n}Suggestion` as keyof typeof review] as string}
          />
        ))}
      </div>

      {review.generalComment && (
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="font-bold mb-2">Comentário Geral</h3>
          <p className="text-sm text-gray-700">{review.generalComment}</p>
        </div>
      )}

      {review.highlightedExcerpts?.length > 0 && (
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="font-bold mb-3">Trechos Destacados</h3>
          <div className="space-y-3">
            {review.highlightedExcerpts.map((excerpt, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border-l-4 ${
                  excerpt.tipo === "positivo"
                    ? "border-green-500 bg-green-50"
                    : "border-red-500 bg-red-50"
                }`}
              >
                <p className="text-sm italic mb-1">"{excerpt.trecho}"</p>
                <p className="text-sm text-gray-700">{excerpt.comentario}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
