import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateQuestion } from "@/dtos/question/updateQuestion";
import { PendingImageStore } from "@/utils/pendingImageStore";
import { AlertCircle } from "lucide-react";
import { lazy, Suspense } from "react";

const RichTextEditor = lazy(
  () => import("@/components/molecules/richTextEditor/RichTextEditor")
);

interface TabConteudoCreateProps {
  formData: Partial<CreateQuestion>;
  errors: Record<string, string>;
  onChange: (field: keyof CreateQuestion, value: any) => void;
  onImageUpload?: (file: File) => Promise<string>;
  pendingStore?: PendingImageStore;
  token?: string;
}

export function TabConteudoCreate({
  formData,
  errors,
  onChange,
  onImageUpload,
  pendingStore,
  token,
}: TabConteudoCreateProps) {
  return (
    <div className="space-y-6 p-2 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-h3">Enunciado da Questão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Texto da Questão — editor grande */}
          <div className="space-y-2">
            <label className="text-body font-semibold text-muted-foreground">
              Texto da Questão *
            </label>
            <Suspense
              fallback={
                <div className="h-[300px] bg-muted animate-pulse rounded-md" />
              }
            >
              <RichTextEditor
                content={formData.textoQuestao || ""}
                onChange={(val) => onChange("textoQuestao", val)}
                placeholder="Digite o texto da questão..."
                onImageUpload={onImageUpload}
                error={!!errors.textoQuestao}
                minHeight="300px"
                pendingStore={pendingStore}
                token={token}
              />
            </Suspense>
            {errors.textoQuestao && (
              <p className="text-body text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.textoQuestao}
              </p>
            )}
          </div>

          {/* Pergunta */}
          <div className="space-y-2">
            <label className="text-body font-semibold text-muted-foreground">
              Pergunta (opcional)
            </label>
            <Suspense
              fallback={
                <div className="h-[60px] bg-muted animate-pulse rounded-md" />
              }
            >
              <RichTextEditor
                content={formData.pergunta || ""}
                onChange={(val) => onChange("pergunta", val)}
                placeholder="Digite a pergunta específica..."
                compact
                onImageUpload={onImageUpload}
                pendingStore={pendingStore}
                token={token}
              />
            </Suspense>
            <p className="text-caption text-muted-foreground">
              Caso a questão tenha uma pergunta específica após o enunciado
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dica */}
      <div className="p-4 bg-info-muted border border-info/30 rounded-lg">
        <p className="text-body text-info">
          <span className="font-semibold">Dica:</span> Use a barra de
          ferramentas para formatar texto, inserir fórmulas LaTeX e imagens.
        </p>
      </div>
    </div>
  );
}
