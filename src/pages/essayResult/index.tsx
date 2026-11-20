import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/auth";
import { Essay, EssayReview } from "@/dtos/essay";
import { getEssayById } from "@/services/essay";
import ScoreOverview from "./ScoreOverview";
import CompetencyDetail from "./CompetencyDetail";

export default function EssayResult() {
  const { id } = useParams<{ id: string }>();
  const { data: { token } } = useAuthStore();
  const [essay, setEssay] = useState<Essay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getEssayById(token, id)
      .then(setEssay)
      .catch(() => toast.error("Erro ao carregar redação"))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) return <div className="p-4 sm:p-6 text-center">Carregando...</div>;
  if (!essay) return <div className="p-4 sm:p-6 text-center">Redação não encontrada</div>;

  const aiReview = essay.reviews?.find((r) => r.reviewType === "AI");
  const humanReviews = essay.reviews?.filter((r) => r.reviewType === "HUMAN") ?? [];
  const isWaiting = essay.status === "SUBMITTED";

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-h1 font-bold text-foreground">
        {essay.title || "Minha Redação"}
      </h1>
      <p className="text-body text-muted-foreground">
        Tema: {essay.theme.title}
      </p>

      {isWaiting && (
        <div className="border rounded-lg p-6 bg-warning-muted text-center">
          <p className="text-warning font-semibold">
            Aguardando revisão
          </p>
          <p className="text-body text-warning mt-1">
            Sua redação foi recebida e será revisada em breve.
          </p>
        </div>
      )}

      {aiReview && (
        <ReviewSection title="Correção por IA" review={aiReview} />
      )}

      {humanReviews.map((review) => (
        <ReviewSection
          key={review.id}
          title={`Revisão de ${review.reviewer?.firstName ?? ""} ${review.reviewer?.lastName ?? ""}`}
          subtitle={review.reviewer?.email}
          review={review}
        />
      ))}
    </div>
  );
}

function ReviewSection({
  title,
  subtitle,
  review,
}: {
  title: string;
  subtitle?: string;
  review: EssayReview;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-h3 font-bold">{title}</h2>
        {subtitle && <p className="text-body text-muted-foreground">{subtitle}</p>}
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
      <div className="border rounded-lg p-4 bg-white">
        <h3 className="font-bold mb-2">Comentário Geral</h3>
        <p className="text-body text-foreground">{review.generalComment}</p>
      </div>
      {review.highlightedExcerpts?.length > 0 && (
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="font-bold mb-3">Trechos Destacados</h3>
          <div className="space-y-3">
            {review.highlightedExcerpts.map((excerpt, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border-l-4 ${
                  excerpt.tipo === "positivo"
                    ? "border-success bg-success-muted"
                    : "border-destructive bg-destructive-muted"
                }`}
              >
                <p className="text-body italic mb-1">"{excerpt.trecho}"</p>
                <p className="text-body text-foreground">{excerpt.comentario}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
