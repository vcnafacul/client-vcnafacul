import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/auth";
import { Essay, EssayReview, CreateEssayReviewPayload } from "@/dtos/essay";
import { getEssayById, getEssayReviews, createHumanReview } from "@/services/essay";

const COMP_NAMES = [
  "Domínio da norma culta",
  "Compreensão da proposta",
  "Argumentação",
  "Coesão textual",
  "Proposta de intervenção",
];

interface CompForm {
  score: number;
  feedback: string;
  suggestion: string;
}

const emptyComp = (): CompForm => ({ score: 0, feedback: "", suggestion: "" });

export default function EssayReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: { token, user } } = useAuthStore();
  const [essay, setEssay] = useState<Essay | null>(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [comps, setComps] = useState<CompForm[]>([
    emptyComp(),
    emptyComp(),
    emptyComp(),
    emptyComp(),
    emptyComp(),
  ]);
  const [generalComment, setGeneralComment] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([getEssayById(token, id), getEssayReviews(token, id)])
      .then(([e, reviews]) => {
        setEssay(e);
        const myReview = reviews.find(
          (r: EssayReview) =>
            r.reviewType === "HUMAN" && r.reviewer?.email === user.email
        );
        setAlreadyReviewed(!!myReview);
      })
      .catch(() => toast.error("Erro ao carregar redação"))
      .finally(() => setLoading(false));
  }, [id, token, user.email]);

  const totalScore = comps.reduce((sum, c) => sum + c.score, 0);

  const updateComp = (index: number, field: keyof CompForm, value: string | number) => {
    setComps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmitReview = async () => {
    if (!id) return;
    if (comps.some((c) => !c.feedback.trim() || !c.suggestion.trim())) {
      toast.warn("Preencha feedback e sugestão de todas as competências");
      return;
    }
    if (!generalComment.trim()) {
      toast.warn("Preencha o comentário geral");
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateEssayReviewPayload = {
        comp1Score: comps[0].score,
        comp1Feedback: comps[0].feedback,
        comp1Suggestion: comps[0].suggestion,
        comp2Score: comps[1].score,
        comp2Feedback: comps[1].feedback,
        comp2Suggestion: comps[1].suggestion,
        comp3Score: comps[2].score,
        comp3Feedback: comps[2].feedback,
        comp3Suggestion: comps[2].suggestion,
        comp4Score: comps[3].score,
        comp4Feedback: comps[3].feedback,
        comp4Suggestion: comps[3].suggestion,
        comp5Score: comps[4].score,
        comp5Feedback: comps[4].feedback,
        comp5Suggestion: comps[4].suggestion,
        totalScore,
        generalComment,
      };

      await createHumanReview(token, id, payload);
      toast.success("Revisão enviada com sucesso!");
      navigate(-1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao enviar revisão";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Carregando...</div>;
  if (!essay) return <div className="p-6 text-center">Redação não encontrada</div>;

  const canReview =
    (essay.status === "SUBMITTED" || essay.status === "REVIEWED") && !alreadyReviewed;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Essay content */}
      <div>
        <h1 className="text-2xl font-bold text-marine">
          {essay.title || "Sem título"}
        </h1>
        <p className="text-sm text-grey mb-4">Tema: {essay.theme.title}</p>
        <div className="border rounded-lg p-4 bg-gray-50 whitespace-pre-wrap text-sm">
          {essay.text}
        </div>
      </div>

      {alreadyReviewed && (
        <div className="border rounded-lg p-4 bg-yellow-50 text-center">
          <p className="text-yellow-700 font-semibold">
            Você já revisou esta redação
          </p>
          <p className="text-sm text-yellow-600 mt-1">
            Cada revisor pode enviar apenas uma revisão por redação.
          </p>
        </div>
      )}

      {/* Review form */}
      {canReview && (
        <div className="border rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-bold">Nova Revisão</h2>
          <p className="text-sm text-grey">
            Nota total calculada: <strong>{totalScore}/1000</strong>
          </p>

          {comps.map((comp, i) => (
            <div key={i} className="space-y-2 border-b pb-4">
              <h3 className="font-semibold text-sm">
                Competência {i + 1}: {COMP_NAMES[i]}
              </h3>
              <div className="flex items-center gap-2">
                <label className="text-sm w-24">Nota (0-200):</label>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={comp.score}
                  onChange={(e) =>
                    updateComp(i, "score", Math.min(200, Math.max(0, +e.target.value)))
                  }
                  className="border rounded px-2 py-1 w-24 text-sm"
                />
              </div>
              <textarea
                placeholder="Feedback..."
                value={comp.feedback}
                onChange={(e) => updateComp(i, "feedback", e.target.value)}
                className="w-full border rounded-lg p-2 text-sm"
                rows={2}
              />
              <textarea
                placeholder="Sugestão de melhoria..."
                value={comp.suggestion}
                onChange={(e) => updateComp(i, "suggestion", e.target.value)}
                className="w-full border rounded-lg p-2 text-sm"
                rows={2}
              />
            </div>
          ))}

          <div>
            <label className="font-semibold text-sm">Comentário Geral</label>
            <textarea
              value={generalComment}
              onChange={(e) => setGeneralComment(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm mt-1"
              rows={4}
              placeholder="Comentário geral sobre a redação..."
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmitReview}
              disabled={submitting}
              className="px-6 py-2 bg-marine text-white rounded-lg hover:bg-marine/90 disabled:opacity-50"
            >
              {submitting ? "Enviando..." : "Enviar revisão"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
