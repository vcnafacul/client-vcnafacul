import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateQuestion } from "@/dtos/question/updateQuestion";
import { AlertCircle } from "lucide-react";

interface TabConteudoCreateProps {
  formData: Partial<CreateQuestion>;
  errors: Record<string, string>;
  onChange: (field: keyof CreateQuestion, value: any) => void;
}

export function TabConteudoCreate({
  formData,
  errors,
  onChange,
}: TabConteudoCreateProps) {
  const alternativas: { letra: string; campo: keyof CreateQuestion }[] = [
    { letra: "A", campo: "textoAlternativaA" },
    { letra: "B", campo: "textoAlternativaB" },
    { letra: "C", campo: "textoAlternativaC" },
    { letra: "D", campo: "textoAlternativaD" },
    { letra: "E", campo: "textoAlternativaE" },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Texto da Questão */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📝 Enunciado da Questão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Texto da Questão */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">
              Texto da Questão *
            </label>
            <Textarea
              value={formData.textoQuestao || ""}
              onChange={(e) => onChange("textoQuestao", e.target.value)}
              className={`min-h-[120px] ${
                errors.textoQuestao ? "border-red-500" : ""
              }`}
              placeholder="Digite o texto da questão..."
            />
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
            <Input
              value={formData.pergunta || ""}
              onChange={(e) => onChange("pergunta", e.target.value)}
              placeholder="Digite a pergunta específica..."
            />
            <p className="text-xs text-gray-500">
              Caso a questão tenha uma pergunta específica após o enunciado
            </p>
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
            const isCorreta = formData.alternativa === alt.letra;

            return (
              <div
                key={alt.letra}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isCorreta
                    ? "bg-green-50 border-green-400 shadow-sm"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-gray-700 min-w-[24px]">
                      {alt.letra})
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        value={alt.letra}
                        id={`radio-${alt.letra}`}
                        checked={formData.alternativa === alt.letra}
                        onChange={(e) =>
                          onChange("alternativa", e.target.value)
                        }
                        className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
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
                    value={formData[alt.campo] || ""}
                    onChange={(e) => onChange(alt.campo, e.target.value)}
                    className={errors[alt.campo] ? "border-red-500" : ""}
                    placeholder={`Digite a alternativa ${alt.letra}...`}
                  />
                  {errors[alt.campo] && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors[alt.campo]}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Erro de seleção de alternativa */}
          {errors.alternativa && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.alternativa}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resposta Correta Preview */}
      {formData.alternativa && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">
              🎯 Resposta Correta Selecionada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {formData.alternativa}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Alternativa correta</p>
                <p className="text-lg font-semibold text-green-800">
                  Opção {formData.alternativa}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dica */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">💡 Dica:</span> Preencha todos os
          campos obrigatórios (*) e selecione a alternativa correta antes de
          criar a questão.
        </p>
      </div>
    </div>
  );
}
