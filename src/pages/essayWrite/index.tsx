import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/auth";
import { useEssayStore } from "@/store/essay";
import { EssayTheme } from "@/dtos/essay";
import {
  getAvailableThemes,
  createEssay,
  submitEssay,
  updateDraftEssay,
} from "@/services/essay";
import ThemeDisplay from "./ThemeDisplay";
import ThemeSelector from "./ThemeSelector";
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

  const [availableThemes, setAvailableThemes] = useState<EssayTheme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<EssayTheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    getAvailableThemes(token)
      .then(async (themes) => {
        setAvailableThemes(themes);

        // If user has a draft for one of the available themes, auto-select it
        if (themeId) {
          const draftTheme = themes.find((t) => t.id === themeId);
          if (draftTheme) {
            setSelectedTheme(draftTheme);
          } else {
            // Draft theme no longer available — clear stale draft
            clearDraft();
          }
        }
      })
      .catch(() => toast.error("Erro ao carregar temas"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSelectTheme = (theme: EssayTheme) => {
    if (themeId && themeId !== theme.id) {
      clearDraft();
    }
    setSelectedTheme(theme);
  };

  const handleBack = () => {
    setSelectedTheme(null);
  };

  const handleSubmit = async () => {
    if (!selectedTheme || !title.trim() || !text.trim()) {
      toast.warn("Preencha o titulo e o texto da redacao");
      return;
    }

    setSubmitting(true);
    try {
      let essayId = draftId;
      if (!essayId) {
        const created = await createEssay(token, selectedTheme.id, title, text);
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
    if (!selectedTheme) return;
    try {
      if (!draftId) {
        const created = await createEssay(token, selectedTheme.id, title, text);
        setDraftId(created.id);
        setDraft(selectedTheme.id, title, text, created.id);
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

  // Theme selection screen
  if (!selectedTheme) {
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
        <ThemeSelector themes={availableThemes} onSelect={handleSelectTheme} />
      </div>
    );
  }

  // Editor screen
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="text-marine hover:underline text-sm"
          >
            &larr; Trocar tema
          </button>
          <h1 className="text-2xl font-bold text-marine">Escrever Redação</h1>
        </div>
        <Link
          to={`/dashboard/${ESSAY_HISTORY}`}
          className="text-marine hover:underline text-sm"
        >
          Ver histórico
        </Link>
      </div>
      <ThemeDisplay theme={selectedTheme} />
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            updateTitle(e.target.value);
            if (selectedTheme)
              setDraft(selectedTheme.id, e.target.value, text, draftId ?? undefined);
          }}
          placeholder="Titulo da sua redacao"
          className="w-full border rounded-lg p-3 text-lg font-semibold mb-4 focus:ring-2 focus:ring-marine focus:outline-none"
          maxLength={200}
        />
        <EssayEditor
          content={text}
          onChange={(newText) => {
            updateText(newText);
            if (selectedTheme)
              setDraft(selectedTheme.id, title, newText, draftId ?? undefined);
          }}
          onWordCountChange={setWordCount}
        />
        <div className="mt-2">
          <WordCounter text={text} wordCount={wordCount} />
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
          onClick={() => setShowConfirmModal(true)}
          disabled={submitting || !title.trim() || !text.trim()}
          className="px-6 py-2 bg-marine text-white rounded-lg hover:bg-marine/90 disabled:opacity-50"
        >
          {submitting ? "Enviando..." : "Enviar redacao"}
        </button>
      </div>
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 space-y-4">
            <h2 className="text-lg font-bold text-marine">Confirmar envio</h2>
            <p className="text-sm text-gray-700">
              Atenção: a submissão é única. Uma vez enviada, não será possível
              realizar uma nova redação para este tema. Deseja continuar?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  handleSubmit();
                }}
                className="px-4 py-2 bg-marine text-white rounded-lg hover:bg-marine/90"
              >
                Confirmar envio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
