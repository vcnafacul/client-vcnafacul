import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RichTextRenderer } from "@/components/atoms/richTextRenderer/RichTextRenderer";
import { PendingImageStore } from "@/utils/pendingImageStore";
import { AlertCircle } from "lucide-react";
import { lazy, Suspense } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { ConteudoFormData } from "../TabConteudo/schema";

const RichTextEditor = lazy(
  () => import("@/components/molecules/richTextEditor/RichTextEditor")
);

type AlternativaLetra = "A" | "B" | "C" | "D" | "E";

interface TabAlternativasProps {
  form: UseFormReturn<ConteudoFormData>;
  isEditing: boolean;
  contentFormat: "plain" | "markdown";
  onImageUpload?: (file: File) => Promise<string>;
  pendingStore?: PendingImageStore;
  token?: string;
}

const alternativas: { letra: AlternativaLetra; campo: string }[] = [
  { letra: "A", campo: "textoAlternativaA" },
  { letra: "B", campo: "textoAlternativaB" },
  { letra: "C", campo: "textoAlternativaC" },
  { letra: "D", campo: "textoAlternativaD" },
  { letra: "E", campo: "textoAlternativaE" },
];

export function TabAlternativas({
  form,
  isEditing,
  contentFormat,
  onImageUpload,
  pendingStore,
  token,
}: TabAlternativasProps) {
  const { control, formState: { errors } } = form;
  const respostaCorreta = form.watch("alternativa");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alternativas</CardTitle>
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
                  <div className="flex gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span
                        className={`font-bold text-lg min-w-[32px] ${
                          isCorreta ? "text-green-600" : "text-gray-600"
                        }`}
                      >
                        {alt.letra})
                      </span>
                      <div className="flex-1">
                        <RichTextRenderer
                          content={textoAlternativa || "Sem texto"}
                          contentFormat={contentFormat}
                        />
                      </div>
                    </div>
                    {isCorreta && (
                      <Badge
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Correta
                      </Badge>
                    )}
                  </div>
                ) : (
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
                    <Suspense
                      fallback={
                        <div className="h-[60px] bg-gray-100 animate-pulse rounded-md" />
                      }
                    >
                      <Controller
                        name={alt.campo as any}
                        control={control}
                        render={({ field }) => (
                          <RichTextEditor
                            content={field.value}
                            onChange={field.onChange}
                            placeholder={`Digite a alternativa ${alt.letra}...`}
                            compact
                            onImageUpload={onImageUpload}
                            error={
                              !!errors[alt.campo as keyof typeof errors]
                            }
                            pendingStore={pendingStore}
                            token={token}
                          />
                        )}
                      />
                    </Suspense>
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

      {/* Resposta Correta */}
      {!isEditing && respostaCorreta && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">
              Resposta Correta
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
    </div>
  );
}
