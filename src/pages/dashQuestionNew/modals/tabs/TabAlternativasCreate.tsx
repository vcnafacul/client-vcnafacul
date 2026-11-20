import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CreateQuestion } from "@/dtos/question/updateQuestion";
import { PendingImageStore } from "@/utils/pendingImageStore";
import { AlertCircle } from "lucide-react";
import { lazy, Suspense } from "react";

const RichTextEditor = lazy(
  () => import("@/components/molecules/richTextEditor/RichTextEditor")
);

interface TabAlternativasCreateProps {
  formData: Partial<CreateQuestion>;
  errors: Record<string, string>;
  onChange: (field: keyof CreateQuestion, value: any) => void;
  onImageUpload?: (file: File) => Promise<string>;
  pendingStore?: PendingImageStore;
  token?: string;
}

const alternativas: { letra: string; campo: keyof CreateQuestion }[] = [
  { letra: "A", campo: "textoAlternativaA" },
  { letra: "B", campo: "textoAlternativaB" },
  { letra: "C", campo: "textoAlternativaC" },
  { letra: "D", campo: "textoAlternativaD" },
  { letra: "E", campo: "textoAlternativaE" },
];

export function TabAlternativasCreate({
  formData,
  errors,
  onChange,
  onImageUpload,
  pendingStore,
  token,
}: TabAlternativasCreateProps) {
  return (
    <div className="space-y-6 p-2 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alternativas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alternativas.map((alt) => {
            const isCorreta = formData.alternativa === alt.letra;

            return (
              <div
                key={alt.letra}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isCorreta
                    ? "bg-success-muted border-success shadow-sm"
                    : "bg-page border-border"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-foreground min-w-[24px]">
                      {alt.letra})
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        value={alt.letra}
                        id={`radio-create-${alt.letra}`}
                        checked={formData.alternativa === alt.letra}
                        onChange={(e) =>
                          onChange("alternativa", e.target.value)
                        }
                        className="w-4 h-4 text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                      />
                      <Label
                        htmlFor={`radio-create-${alt.letra}`}
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        Correta
                      </Label>
                    </div>
                  </div>
                  <Suspense
                    fallback={
                      <div className="h-[60px] bg-muted animate-pulse rounded-md" />
                    }
                  >
                    <RichTextEditor
                      content={(formData[alt.campo] as string) || ""}
                      onChange={(val) => onChange(alt.campo, val)}
                      placeholder={`Digite a alternativa ${alt.letra}...`}
                      compact
                      onImageUpload={onImageUpload}
                      error={!!errors[alt.campo]}
                      pendingStore={pendingStore}
                      token={token}
                    />
                  </Suspense>
                  {errors[alt.campo] && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors[alt.campo]}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {errors.alternativa && (
            <div className="p-3 bg-destructive-muted border border-destructive rounded-md">
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.alternativa}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resposta Correta Preview */}
      {formData.alternativa && (
        <Card className="bg-success-muted border-success">
          <CardHeader>
            <CardTitle className="text-lg text-success">
              Resposta Correta Selecionada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center">
                <span className="text-success-foreground text-2xl font-bold">
                  {formData.alternativa}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alternativa correta</p>
                <p className="text-lg font-semibold text-success">
                  Opção {formData.alternativa}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
