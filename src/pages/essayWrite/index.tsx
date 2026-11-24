import { Button } from "@/components/ui/button";
import { PageHeader, PageShell } from "@/components/ui/page-header";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth";
import { useEssayStore } from "@/store/essay";
import { EssayTheme } from "@/dtos/essay";
import {
  getAvailableThemes,
  createEssay,
  submitEssay,
  updateDraftEssay,
  submitEssayImage,
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
  const [mode, setMode] = useState<'select' | 'type' | 'upload'>('select');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    getAvailableThemes(token)
      .then(async (themes) => {
        setAvailableThemes(themes);

        // If user has a draft for one of the available themes, auto-select it
        if (themeId) {
          const draftTheme = themes.find((t) => t.id === themeId);
          if (draftTheme) {
            setSelectedTheme(draftTheme);
            setMode('type');
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
    setMode('select');
    setSelectedFile(null);
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

  const handleSubmitImage = async () => {
    if (!selectedTheme || !selectedFile) return;

    setSubmitting(true);
    try {
      const result = await submitEssayImage(token, selectedTheme.id, selectedFile);
      clearDraft();
      toast.success("Redação enviada com sucesso!");
      navigate(`/dashboard/${ESSAY_WRITE}/${result.id}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao enviar redação";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato não aceito. Envie JPG, PNG ou PDF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo deve ter no máximo 5MB.");
      return;
    }
    setSelectedFile(file);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // O cabeçalho padrão da dash (ui/page-header): voltar ao lado do título e
  // "Ver histórico" nas ações, que quebram para baixo no celular.
  // Chamada como `{cabecalho()}` (ver semComponenteNoRender.test.ts).
  const cabecalho = (
    titulo: string,
    voltar?: { label: string; onClick: () => void },
  ) => (
    <PageHeader
      title={titulo}
      backButton={
        voltar ? (
          <Button variant="ghost" size="sm" onClick={voltar.onClick}>
            &larr; {voltar.label}
          </Button>
        ) : undefined
      }
      actions={
        <Button variant="outline" asChild>
          <Link to={`/dashboard/${ESSAY_HISTORY}`}>Ver histórico</Link>
        </Button>
      }
    />
  );

  if (loading) {
    return <div className="p-4 sm:p-6 text-center">Carregando...</div>;
  }

  // Theme selection screen
  if (!selectedTheme) {
    return (
      <PageShell className="max-w-4xl">
        {cabecalho("Escrever Redação")}
        <ThemeSelector themes={availableThemes} onSelect={handleSelectTheme} />
      </PageShell>
    );
  }

  // Mode select screen
  if (mode === 'select') {
    return (
      <PageShell className="max-w-4xl">
        {cabecalho("Escrever Redação", {
          label: "Trocar tema",
          onClick: handleBack,
        })}
        <ThemeDisplay theme={selectedTheme} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setMode('type')}
            className="border-2 border-primary rounded-lg p-6 text-center hover:bg-primary/5 transition-colors"
          >
            <div className="text-h1 mb-2">✍️</div>
            <div className="font-bold text-foreground">Escrever no editor</div>
            <p className="text-body text-muted-foreground mt-1">Digite sua redação diretamente no editor de texto</p>
          </button>
          <button
            onClick={() => setMode('upload')}
            className="border-2 border-primary rounded-lg p-6 text-center hover:bg-primary/5 transition-colors"
          >
            <div className="text-h1 mb-2">📷</div>
            <div className="font-bold text-foreground">Enviar foto/PDF</div>
            <p className="text-body text-muted-foreground mt-1">Envie uma foto ou PDF da sua redação manuscrita</p>
          </button>
        </div>
      </PageShell>
    );
  }

  // Upload screen
  if (mode === 'upload') {
    return (
      <PageShell className="max-w-4xl">
        {cabecalho("Enviar Redação", {
          label: "Voltar",
          onClick: () => {
            setMode('select');
            setSelectedFile(null);
          },
        })}
        <ThemeDisplay theme={selectedTheme} />
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          {!selectedFile ? (
            <label className="cursor-pointer">
              <div className="text-h1 mb-3 text-muted-foreground">📁</div>
              <p className="text-body text-muted-foreground mb-2">
                Clique para selecionar um arquivo
              </p>
              <p className="text-caption text-muted-foreground">JPG, PNG ou PDF — máximo 5MB</p>
              <input
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="space-y-2">
              <p className="font-semibold text-foreground">{selectedFile.name}</p>
              <p className="text-body text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-body text-destructive hover:underline"
              >
                Remover arquivo
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-4 justify-end">
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={submitting || !selectedFile}
            className="w-full sm:w-auto px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Enviando..." : "Enviar redação"}
          </button>
        </div>
        {showConfirmModal && (
          <AlertDialog
            open
            onOpenChange={(aberto) => !aberto && setShowConfirmModal(false)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar envio</AlertDialogTitle>
                <AlertDialogDescription>
                  Atenção: a submissão é única. Uma vez enviada, não será possível
                  realizar uma nova redação para este tema. Deseja continuar?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setShowConfirmModal(false);
                    handleSubmitImage();
                  }}
                >
                  Confirmar envio
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </PageShell>
    );
  }

  // Editor screen (mode === 'type')
  return (
    <PageShell className="max-w-4xl">
      {cabecalho("Escrever Redação", {
        label: "Voltar",
        onClick: () => setMode('select'),
      })}
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
          className="w-full border rounded-lg p-3 text-h3 font-semibold mb-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus:outline-none"
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
      {/* No celular empilhados, com o envio em cima. */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 sm:justify-end">
        <button
          onClick={handleSaveDraft}
          className="w-full sm:w-auto px-6 py-2 border border-primary text-foreground rounded-lg hover:bg-page"
        >
          Salvar rascunho
        </button>
        <button
          onClick={() => setShowConfirmModal(true)}
          disabled={submitting || !title.trim() || !text.trim()}
          className="w-full sm:w-auto px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? "Enviando..." : "Enviar redacao"}
        </button>
      </div>
      {showConfirmModal && (
        <AlertDialog
          open
          onOpenChange={(aberto) => !aberto && setShowConfirmModal(false)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar envio</AlertDialogTitle>
              <AlertDialogDescription>
                Atenção: a submissão é única. Uma vez enviada, não será possível
                realizar uma nova redação para este tema. Deseja continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowConfirmModal(false);
                  handleSubmit();
                }}
              >
                Confirmar envio
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </PageShell>
  );
}
