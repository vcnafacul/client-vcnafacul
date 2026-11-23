import { useEffect, useRef, useState } from "react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EssayTheme } from "@/dtos/essay";
import { RichTextEditor } from "@/components/molecules/richTextEditor/RichTextEditor";
import { useAuthStore } from "@/store/auth";
import { PendingImageStore } from "@/utils/pendingImageStore";
import {
  getEssayThemeAssetImage,
  uploadEssayThemeAsset,
} from "@/services/essay/themeAssets";

interface ThemeFormProps {
  initial?: EssayTheme | null;
  onSave: (data: {
    title: string;
    motivationalText: string;
    instruction: string;
    weekStart: string;
    weekEnd: string;
  }) => void | Promise<void>;
  onCancel: () => void;
}

export default function ThemeForm({ initial, onSave, onCancel }: ThemeFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [motivationalText, setMotivationalText] = useState(
    initial?.motivationalText ?? "",
  );
  const [instruction, setInstruction] = useState(initial?.instruction ?? "");
  const [weekStart, setWeekStart] = useState(initial?.weekStart ?? "");
  const [weekEnd, setWeekEnd] = useState(initial?.weekEnd ?? "");
  const [salvando, setSalvando] = useState(false);
  const {
    data: { token },
  } = useAuthStore();

  // Imagens ficam no navegador até o Salvar (mesmo padrão das Novidades e do
  // banco de questões): cancelar não deixa arquivo órfão no R2.
  const pendingStoreRef = useRef(new PendingImageStore());
  useEffect(() => {
    const store = pendingStoreRef.current;
    return () => store.cleanup();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const store = pendingStoreRef.current;
      store.pruneUnused(motivationalText);
      const replacements = await store.uploadAll((file) =>
        uploadEssayThemeAsset(file, token),
      );
      const texto = PendingImageStore.replaceInMarkdown(
        motivationalText,
        replacements,
      );
      await onSave({
        title,
        motivationalText: texto,
        instruction,
        weekStart,
        weekEnd,
      });
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao enviar as imagens",
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !salvando && onCancel()}>
      <DialogContent
        size="lg"
        aria-describedby={undefined}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{initial ? "Editar Tema" : "Novo Tema"}</DialogTitle>
        </DialogHeader>
        <DialogBody className="-mx-1 px-1">
          <form
            id="form-tema-redacao"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="tema-titulo"
                className="block text-body font-semibold mb-1"
              >
                Título
              </label>
              <input
                id="tema-titulo"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <span
                className="block text-body font-semibold mb-1"
              >
                Texto Motivador
              </span>
              <RichTextEditor
                content={motivationalText}
                onChange={setMotivationalText}
                onImageUpload={async (file: File) =>
                  pendingStoreRef.current.add(file)
                }
                pendingStore={pendingStoreRef.current}
                token={token}
                fetchAsset={getEssayThemeAssetImage}
                placeholder="Digite os textos motivadores..."
                minHeight="200px"
              />
              <p className="text-caption text-muted-foreground mt-1">
                Para inserir imagens, use o botão de imagem da barra (JPG, PNG, WEBP ou GIF, até 5MB cada).
              </p>
            </div>
            <div>
              <label
                htmlFor="tema-instrucao"
                className="block text-body font-semibold mb-1"
              >
                Instrução (opcional)
              </label>
              <textarea
                id="tema-instrucao"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                rows={3}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="tema-inicio"
                  className="block text-body font-semibold mb-1"
                >
                  Início da Semana
                </label>
                <input
                  id="tema-inicio"
                  type="date"
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value)}
                  required
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label
                  htmlFor="tema-fim"
                  className="block text-body font-semibold mb-1"
                >
                  Fim da Semana
                </label>
                <input
                  id="tema-fim"
                  type="date"
                  value={weekEnd}
                  onChange={(e) => setWeekEnd(e.target.value)}
                  required
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" form="form-tema-redacao" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
