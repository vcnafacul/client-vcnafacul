import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RichTextRenderer } from "@/components/atoms/richTextRenderer/RichTextRenderer";
import { AlertCircle, Edit, Loader2, Save, X } from "lucide-react";
import { PendingImageStore } from "@/utils/pendingImageStore";
import { lazy, Suspense } from "react";
import { Controller, FieldErrors, UseFormReturn } from "react-hook-form";
import { ConteudoFormData } from "./schema";

const RichTextEditor = lazy(
  () => import("@/components/molecules/richTextEditor/RichTextEditor")
);

/**
 * Metadados de cada campo do form: rótulo amigável e em qual aba do modal ele
 * fica. Usado para mostrar, na barra de ações (aba Enunciado, onde vive o botão
 * Salvar), exatamente quais campos bloqueiam o save e onde corrigi-los —
 * inclusive quando o campo inválido está em outra aba (ex.: alternativas vazias
 * em questões legadas com alternativas em imagem).
 */
const FIELD_META: Record<string, { label: string; tab: string }> = {
  textoQuestao: { label: "Texto da questão", tab: "Enunciado" },
  pergunta: { label: "Pergunta", tab: "Enunciado" },
  textoAlternativaA: { label: "Alternativa A", tab: "Alternativas" },
  textoAlternativaB: { label: "Alternativa B", tab: "Alternativas" },
  textoAlternativaC: { label: "Alternativa C", tab: "Alternativas" },
  textoAlternativaD: { label: "Alternativa D", tab: "Alternativas" },
  textoAlternativaE: { label: "Alternativa E", tab: "Alternativas" },
  alternativa: { label: "Alternativa correta", tab: "Alternativas" },
};

function collectFieldErrors(errors: FieldErrors<ConteudoFormData>) {
  return Object.entries(errors)
    .filter(([, err]) => err?.message)
    .map(([field, err]) => ({
      field,
      label: FIELD_META[field]?.label ?? field,
      tab: FIELD_META[field]?.tab,
      message: String((err as { message?: unknown })?.message ?? "inválido"),
    }));
}

interface TabConteudoProps {
  form: UseFormReturn<ConteudoFormData>;
  isEditing: boolean;
  isSaving: boolean;
  isDirty: boolean;
  isValid: boolean;
  canEdit: boolean;
  contentFormat: "plain" | "markdown";
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onImageUpload?: (file: File) => Promise<string>;
  pendingStore?: PendingImageStore;
  token?: string;
}

export function TabConteudo({
  form,
  isEditing,
  isSaving,
  isDirty,
  isValid,
  canEdit,
  contentFormat,
  onEdit,
  onSave,
  onCancel,
  onImageUpload,
  pendingStore,
  token,
}: TabConteudoProps) {
  const { control, formState: { errors } } = form;
  const textoQuestao = form.watch("textoQuestao");
  const pergunta = form.watch("pergunta");

  return (
    <div className="space-y-6">
      {/* Enunciado da Questão */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Enunciado da Questão</CardTitle>
            {isEditing && (
              <span className="text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Modo Edição
              </span>
            )}
            {isDirty && !isEditing && (
              <span className="text-sm font-normal text-amber-600 bg-amber-50 px-2 py-1 rounded">
                Alterações não salvas
              </span>
            )}
          </div>

          {!isEditing && canEdit && (
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Conteúdo
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Texto da Questão — editor grande */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">
              Texto da Questão *
            </label>
            {!isEditing ? (
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200 min-h-[200px]">
                <RichTextRenderer
                  content={textoQuestao || ""}
                  contentFormat={contentFormat}
                />
              </div>
            ) : (
              <Suspense
                fallback={
                  <div className="h-[300px] bg-gray-100 animate-pulse rounded-md" />
                }
              >
                <Controller
                  name="textoQuestao"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor
                      content={field.value}
                      onChange={field.onChange}
                      placeholder="Digite o texto da questão..."
                      onImageUpload={onImageUpload}
                      error={!!errors.textoQuestao}
                      minHeight="300px"
                      pendingStore={pendingStore}
                      token={token}
                    />
                  )}
                />
              </Suspense>
            )}
            {errors.textoQuestao && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.textoQuestao.message}
              </p>
            )}
          </div>

          {/* Pergunta (opcional) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">
              Pergunta (opcional)
            </label>
            {!isEditing ? (
              pergunta ? (
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  <RichTextRenderer
                    content={pergunta}
                    contentFormat={contentFormat}
                  />
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-base text-gray-400">Não definida</p>
                </div>
              )
            ) : (
              <Suspense
                fallback={
                  <div className="h-[60px] bg-gray-100 animate-pulse rounded-md" />
                }
              >
                <Controller
                  name="pergunta"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor
                      content={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Digite a pergunta (opcional)..."
                      compact
                      onImageUpload={onImageUpload}
                      error={!!errors.pergunta}
                      pendingStore={pendingStore}
                      token={token}
                    />
                  )}
                />
              </Suspense>
            )}
            {errors.pergunta && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.pergunta.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Revisões Necessárias */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Revisões Necessárias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
              <Controller
                name="textClassification"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={!isEditing}
                  />
                )}
              />
              <span className="text-sm">Texto da Questão/Alternativas</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
              <Controller
                name="alternativeClassfication"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={!isEditing}
                  />
                )}
              />
              <span className="text-sm">Alternativa Correta</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Barra de Ações */}
      {isEditing && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                {isDirty && (
                  <p className="text-sm text-amber-600 font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Você tem alterações não salvas
                  </p>
                )}
                {!isValid && isDirty && (
                  <div className="mt-1 space-y-1">
                    <p className="text-sm text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Corrija os campos abaixo antes de salvar:
                    </p>
                    <ul className="text-sm text-red-600 list-disc list-inside space-y-0.5">
                      {collectFieldErrors(errors).map((e) => (
                        <li key={e.field}>
                          <span className="font-medium">{e.label}</span>
                          {e.tab && (
                            <span className="text-red-500"> (aba {e.tab})</span>
                          )}
                          : {e.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={onCancel}
                  disabled={isSaving}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={onSave}
                  disabled={isSaving || !isDirty || !isValid}
                  variant="default"
                  size="sm"
                  className="bg-primary"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Conteúdo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
