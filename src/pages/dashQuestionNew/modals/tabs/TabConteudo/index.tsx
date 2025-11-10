import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Edit, Loader2, Save, X } from "lucide-react";
import { Controller } from "react-hook-form";
import { AlternativaLetra, TabConteudoProps } from "./types";
import { useConteudoForm } from "./useConteudoForm";

/**
 * Tab de Conteúdo - Modo View e Edit
 *
 * Features:
 * - Visualização de texto da questão e alternativas
 * - Edição inline com validação
 * - Salvamento independente (apenas esta tab)
 * - Radio buttons para selecionar resposta correta
 * - Indicadores visuais de estado (editando, não salvo, salvando)
 * - Flags de revisão necessária
 */
export function TabConteudo({ question, canEdit = false }: TabConteudoProps) {
  const {
    form,
    control,
    register,
    isEditing,
    isSaving,
    isDirty,
    isValid,
    errors,
    handleEdit,
    handleSave,
    handleCancel,
  } = useConteudoForm({ question });

  const alternativas: { letra: AlternativaLetra; campo: string }[] = [
    { letra: "A", campo: "textoAlternativaA" },
    { letra: "B", campo: "textoAlternativaB" },
    { letra: "C", campo: "textoAlternativaC" },
    { letra: "D", campo: "textoAlternativaD" },
    { letra: "E", campo: "textoAlternativaE" },
  ];

  // Usar valores do formulário em vez da prop question
  const textoQuestao = form.watch("textoQuestao");
  const pergunta = form.watch("pergunta");
  const respostaCorreta = form.watch("alternativa");

  return (
    <div className="space-y-6">
      {/* Texto da Questão */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">📝 Enunciado da Questão</CardTitle>
            {isEditing && (
              <span className="text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Modo Edição
              </span>
            )}
            {isDirty && !isEditing && (
              <span className="text-sm font-normal text-amber-600 bg-amber-50 px-2 py-1 rounded">
                • Alterações não salvas
              </span>
            )}
          </div>

          {/* Botão Editar (aparece só no modo visualização) */}
          {!isEditing && canEdit && (
            <Button size="sm" variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Conteúdo
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Texto da Questão */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">
              Texto da Questão *
            </label>
            {!isEditing ? (
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200 min-h-[120px]">
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {textoQuestao || "Sem texto"}
                </p>
              </div>
            ) : (
              <Textarea
                {...register("textoQuestao")}
                className={`min-h-[120px] ${
                  errors.textoQuestao ? "border-red-500" : ""
                }`}
                placeholder="Digite o texto da questão..."
              />
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
                  <p className="text-base">{pergunta}</p>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-base text-gray-400">Não definida</p>
                </div>
              )
            ) : (
              <Input
                {...register("pergunta")}
                className={errors.pergunta ? "border-red-500" : ""}
                placeholder="Digite a pergunta (opcional)..."
              />
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

      {/* Alternativas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">✅ Alternativas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alternativas.map((alt) => {
            const textoAlternativa = form.watch(alt.campo as any);
            const isCorreta = respostaCorreta === alt.letra;

            return (
              <div
                key={alt.letra}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isCorreta
                    ? "bg-green-50 border-green-400 shadow-sm"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                {!isEditing ? (
                  // Modo Visualização
                  <div className="flex gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span
                        className={`font-bold text-lg min-w-[32px] ${
                          isCorreta ? "text-green-600" : "text-gray-600"
                        }`}
                      >
                        {alt.letra})
                      </span>
                      <p className="text-base leading-relaxed flex-1">
                        {textoAlternativa || "Sem texto"}
                      </p>
                    </div>
                    {isCorreta && (
                      <Badge
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        ✓ Correta
                      </Badge>
                    )}
                  </div>
                ) : (
                  // Modo Edição
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-gray-700 min-w-[24px]">
                        {alt.letra})
                      </span>
                      <div className="flex items-center gap-2">
                        <Controller
                          name="alternativa"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="radio"
                              value={alt.letra}
                              id={`radio-${alt.letra}`}
                              checked={field.value === alt.letra}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                            />
                          )}
                        />
                        <Label
                          htmlFor={`radio-${alt.letra}`}
                          className="text-sm text-gray-600 cursor-pointer"
                        >
                          Correta
                        </Label>
                      </div>
                    </div>
                    <Input
                      {...register(alt.campo as any)}
                      className={
                        errors[alt.campo as keyof typeof errors]
                          ? "border-red-500"
                          : ""
                      }
                      placeholder={`Digite a alternativa ${alt.letra}...`}
                    />
                    {errors[alt.campo as keyof typeof errors] && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors[alt.campo as keyof typeof errors]?.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Erro de seleção de alternativa */}
          {errors.alternativa && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.alternativa.message}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resposta Correta (só aparece no modo visualização) */}
      {!isEditing && respostaCorreta && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">
              🎯 Resposta Correta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {respostaCorreta}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Alternativa correta</p>
                <p className="text-lg font-semibold text-green-800">
                  Opção {respostaCorreta}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revisões Necessárias */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">⚠️ Revisões Necessárias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Texto da Questão/Alternativas */}
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

            {/* Alternativa Correta */}
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

      {/* Barra de Ações (aparece apenas no modo edição) */}
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
                  <p className="text-sm text-red-600 mt-1">
                    Por favor, corrija os erros antes de salvar
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCancel}
                  disabled={isSaving}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
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
