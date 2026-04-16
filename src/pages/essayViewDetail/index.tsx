import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiCpu, FiUser } from "react-icons/fi";
import { useAuthStore } from "@/store/auth";
import { Essay, EssayReview } from "@/dtos/essay";
import { getEssayById, getEssayReviews, downloadEssayImage } from "@/services/essay";
import RichTextRenderer from "@/components/atoms/richTextRenderer/RichTextRenderer";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  SUBMITTED: "Aguardando revisão",
  REVIEWED: "Corrigida",
};

export default function EssayViewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: { token } } = useAuthStore();
  const [essay, setEssay] = useState<Essay | null>(null);
  const [reviews, setReviews] = useState<EssayReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([getEssayById(token, id), getEssayReviews(token, id)])
      .then(([e, r]) => {
        setEssay(e);
        setReviews(r);
      })
      .catch(() => toast.error("Erro ao carregar redação"))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) return <div className="p-6 text-center">Carregando...</div>;
  if (!essay) return <div className="p-6 text-center">Redação não encontrada</div>;

  // Current path without trailing slash
  const basePath = location.pathname.replace(/\/$/, "");

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Essay content */}
      <div>
        <h1 className="text-2xl font-bold text-marine">
          {essay.title || "Sem título"}
        </h1>
        <div className="flex gap-4 text-sm text-grey mt-1 mb-4">
          <span>Tema: {essay.theme.title}</span>
          <span>Status: {STATUS_LABELS[essay.status] ?? essay.status}</span>
          {essay.submittedAt && (
            <span>
              Enviada em: {new Date(essay.submittedAt).toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>
        {essay.inputType === 'UPLOADED' ? (
          <div className="border rounded-lg p-6 bg-gray-50 text-center space-y-3">
            <p className="text-sm text-grey">
              Redação enviada como {essay.mimeType === 'application/pdf' ? 'PDF' : 'imagem'}
            </p>
            <button
              onClick={() => downloadEssayImage(token, essay.id).catch(() => toast.error("Erro ao baixar arquivo"))}
              className="px-4 py-2 bg-marine text-white rounded-lg hover:bg-marine/90 text-sm"
            >
              Baixar arquivo
            </button>
          </div>
        ) : (
          <div className="border rounded-lg p-4 bg-gray-50 text-sm">
            <RichTextRenderer
              content={essay.text ?? ""}
              contentFormat="markdown"
            />
          </div>
        )}
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">
          Revisões ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-grey">Nenhuma revisão realizada ainda.</p>
        ) : (
          <div className="grid gap-3">
            {reviews.map((review) => (
              <button
                key={review.id}
                onClick={() => navigate(`${basePath}/${review.id}`)}
                className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors text-left flex items-center gap-4"
              >
                <div className="flex-shrink-0 text-marine">
                  {review.reviewType === "AI" ? (
                    <FiCpu className="h-6 w-6" />
                  ) : (
                    <FiUser className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">
                    {review.reviewType === "AI"
                      ? "Correção por IA"
                      : `${review.reviewer?.firstName ?? ""} ${review.reviewer?.lastName ?? ""}`}
                  </div>
                  <div className="text-xs text-grey mt-0.5">
                    {review.reviewType === "AI" ? "Inteligência Artificial" : "Revisão Humana"}
                    {" · "}
                    {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold text-marine">
                    {review.totalScore}
                  </div>
                  <div className="text-xs text-grey">de 1000</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
        >
          Voltar à lista
        </button>
      </div>
    </div>
  );
}
