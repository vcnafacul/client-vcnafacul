import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/auth";
import { useEssayStore } from "@/store/essay";
import { EssayTheme } from "@/dtos/essay";
import {
  getCurrentTheme,
  createEssay,
  submitEssay,
  updateDraftEssay,
} from "@/services/essay";
import ThemeDisplay from "./ThemeDisplay";
import EssayEditor from "./EssayEditor";
import WordCounter from "./WordCounter";
import { ESSAY_HISTORY, ESSAY_WRITE } from "@/routes/path";

export default function EssayWrite() {
  const navigate = useNavigate();
  const {
    data: { token },
  } = useAuthStore();
  const {
    draftId,
    themeId,
    title,
    text,
    setDraft,
    updateText,
    updateTitle,
    setDraftId,
    clearDraft,
  } = useEssayStore();

  const [theme, setTheme] = useState<EssayTheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCurrentTheme(token)
      .then((t) => {
        setTheme(t);
        if (t && themeId !== t.id) {
          clearDraft();
        }
      })
      .catch(() => toast.error("Erro ao carregar tema"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async () => {
    if (!theme || !title.trim() || !text.trim()) {
      toast.warn("Preencha o titulo e o texto da redacao");
      return;
    }

    setSubmitting(true);
    try {
      let essayId = draftId;
      if (!essayId) {
        const created = await createEssay(token, theme.id, title, text);
        essayId = created.id;
      }
      const result = await submitEssay(token, essayId, title, text);
      clearDraft();
      toast.success("Redacao enviada com sucesso!");
      navigate(`/dashboard/${ESSAY_WRITE}/${result.id}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao enviar redacao";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!theme) return;
    try {
      if (!draftId) {
        const created = await createEssay(token, theme.id, title, text);
        setDraftId(created.id);
        setDraft(theme.id, title, text, created.id);
      } else {
        await updateDraftEssay(token, draftId, title, text);
      }
      toast.success("Rascunho salvo");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao salvar rascunho";
      toast.error(message);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Carregando...</div>;
  }

  if (!theme) {
    return (
      <div className="p-6 text-center text-grey">
        Nenhum tema disponivel esta semana.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-marine">Escrever Redação</h1>
        <Link
          to={`/dashboard/${ESSAY_HISTORY}`}
          className="text-marine hover:underline text-sm"
        >
          Ver histórico
        </Link>
      </div>
      <ThemeDisplay theme={theme} />
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            updateTitle(e.target.value);
            if (theme)
              setDraft(theme.id, e.target.value, text, draftId ?? undefined);
          }}
          placeholder="Titulo da sua redacao"
          className="w-full border rounded-lg p-3 text-lg font-semibold mb-4 focus:ring-2 focus:ring-marine focus:outline-none"
          maxLength={200}
        />
        <EssayEditor
          content={text}
          onChange={(newText) => {
            updateText(newText);
            if (theme)
              setDraft(theme.id, title, newText, draftId ?? undefined);
          }}
        />
        <div className="mt-2">
          <WordCounter text={text} />
        </div>
      </div>
      <div className="flex gap-4 justify-end">
        <button
          onClick={handleSaveDraft}
          className="px-6 py-2 border border-marine text-marine rounded-lg hover:bg-gray-50"
        >
          Salvar rascunho
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !title.trim() || !text.trim()}
          className="px-6 py-2 bg-marine text-white rounded-lg hover:bg-marine/90 disabled:opacity-50"
        >
          {submitting ? "Enviando..." : "Enviar redacao"}
        </button>
      </div>
    </div>
  );
}
