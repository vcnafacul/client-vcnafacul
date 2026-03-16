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
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enunciado da Questão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Texto da Questão — editor grande */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">
              Texto da Questão *
            </label>
            <Suspense
              fallback={
                <div className="h-[300px] bg-gray-100 animate-pulse rounded-md" />
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
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.textoQuestao}
              </p>
            )}
          </div>

          {/* Pergunta */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">
              Pergunta (opcional)
            </label>
            <Suspense
              fallback={
                <div className="h-[60px] bg-gray-100 animate-pulse rounded-md" />
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
            <p className="text-xs text-gray-500">
              Caso a questão tenha uma pergunta específica após o enunciado
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dica */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Dica:</span> Use a barra de
          ferramentas para formatar texto, inserir fórmulas LaTeX e imagens.
        </p>
      </div>
    </div>
  );
}
