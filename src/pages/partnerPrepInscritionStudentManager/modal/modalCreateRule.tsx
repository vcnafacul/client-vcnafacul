import { ModalProps } from "@/types/modal";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createRule, CreateRuleDtoInput } from "@/services/partnerPrepForm/createRule";
import { useAuthStore } from "@/store/auth";
import {
  AnswerType,
  QuestionForm,
} from "@/types/partnerPrepForm/questionForm";
import {
  RuleForm,
  RuleType,
  Strategy,
} from "@/types/partnerPrepForm/ruleForm";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { OptionsSelect } from "@/components/ui/options-select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { Info, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

interface ModalCreateRuleProps extends ModalProps {
  isOpen: boolean;
  questions: QuestionForm[];
  onSuccess: (rule: RuleForm) => void;
}

interface RangeItem {
  min: string;
  max: string;
  points: string;
}

interface FormData {
  name: string;
  description: string;
  type: RuleType;
  strategy: Strategy;
  questionId: string;
  weight: string;
  optionPoints: Record<string, string>;
  ranges: RangeItem[];
  referenceValue: string;
  maxScore: string;
  computedQuestionIds: string[];
  expression: string;
}

const initialFormData: FormData = {
  name: "",
  description: "",
  type: RuleType.Score,
  strategy: Strategy.PerOption,
  questionId: "",
  weight: "1",
  optionPoints: {},
  ranges: [{ min: "", max: "", points: "" }],
  referenceValue: "",
  maxScore: "",
  computedQuestionIds: [],
  expression: "",
};

const isComputedStrategy = (s: Strategy) => s === Strategy.ComputedInverseProportional;

export function ModalCreateRule({
  isOpen,
  handleClose,
  questions,
  onSuccess,
}: ModalCreateRuleProps) {
  const {
    data: { token },
  } = useAuthStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvancedExpressions, setShowAdvancedExpressions] = useState(false);

  const selectedQuestion = questions.find((q) => q._id === formData.questionId);

  const numericQuestions = questions.filter(
    (q) => q.answerType === AnswerType.Number
  );

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const getStrategyForQuestion = (question: QuestionForm): Strategy => {
    return question.answerType === AnswerType.Number
      ? Strategy.NumericRange
      : Strategy.PerOption;
  };

  const handleQuestionChange = (questionId: string) => {
    const question = questions.find((q) => q._id === questionId);
    const optionPoints: Record<string, string> = {};
    if (question?.options) {
      question.options.forEach((opt) => {
        optionPoints[opt] = "0";
      });
    }
    setFormData((prev) => ({
      ...prev,
      questionId,
      optionPoints,
      strategy: question ? getStrategyForQuestion(question) : Strategy.PerOption,
    }));
  };

  const handleStrategyChange = (strategy: Strategy) => {
    setFormData((prev) => ({
      ...prev,
      strategy,
      questionId: isComputedStrategy(strategy) ? "" : prev.questionId,
      computedQuestionIds: isComputedStrategy(strategy) ? [] : prev.computedQuestionIds,
      expression: isComputedStrategy(strategy) ? "" : prev.expression,
    }));
    setErrors({});
  };

  const handleOptionPointChange = (option: string, points: string) => {
    setFormData((prev) => ({
      ...prev,
      optionPoints: { ...prev.optionPoints, [option]: points },
    }));
  };

  const addRange = () => {
    setFormData((prev) => ({
      ...prev,
      ranges: [...prev.ranges, { min: "", max: "", points: "" }],
    }));
  };

  const removeRange = (index: number) => {
    if (formData.ranges.length > 1) {
      setFormData((prev) => ({
        ...prev,
        ranges: prev.ranges.filter((_, i) => i !== index),
      }));
    }
  };

  const updateRange = (index: number, field: keyof RangeItem, value: string) => {
    setFormData((prev) => ({
      ...prev,
      ranges: prev.ranges.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    }));
  };

  const addComputedQuestion = (questionId: string) => {
    if (!questionId || formData.computedQuestionIds.includes(questionId)) return;
    setFormData((prev) => {
      if (prev.computedQuestionIds.length >= 3) {
        return prev;
      }
      return {
        ...prev,
        computedQuestionIds: [...prev.computedQuestionIds, questionId],
      };
    });
  };

  const removeComputedQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      computedQuestionIds: prev.computedQuestionIds.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!formData.description.trim()) newErrors.description = "Descrição é obrigatória";

    if (isComputedStrategy(formData.strategy)) {
      if (formData.computedQuestionIds.length < 2)
        newErrors.questionId = "Selecione pelo menos 2 perguntas";
      if (!formData.expression.trim())
        newErrors.config = "Expressão é obrigatória";
      else if (!formData.referenceValue || isNaN(Number(formData.referenceValue)) || Number(formData.referenceValue) <= 0)
        newErrors.config = "Valor de referência deve ser maior que 0";
      else if (formData.maxScore === "" || isNaN(Number(formData.maxScore)))
        newErrors.config = "Pontuação máxima é obrigatória";
    } else {
      if (!formData.questionId) newErrors.questionId = "Selecione uma pergunta";

      if (formData.strategy === Strategy.PerOption) {
        const hasInvalid = Object.values(formData.optionPoints).some(
          (v) => v === "" || isNaN(Number(v))
        );
        if (hasInvalid) newErrors.config = "Preencha a pontuação de todas as opções";
      }

      if (formData.strategy === Strategy.NumericRange) {
        const hasInvalid = formData.ranges.some((r) => r.points === "" || isNaN(Number(r.points)));
        if (hasInvalid) newErrors.config = "Preencha a pontuação de todas as faixas";
      }

      if (formData.strategy === Strategy.InverseProportional) {
        if (!formData.referenceValue || isNaN(Number(formData.referenceValue)) || Number(formData.referenceValue) <= 0)
          newErrors.config = "Valor de referência deve ser maior que 0";
        else if (formData.maxScore === "" || isNaN(Number(formData.maxScore)))
          newErrors.config = "Pontuação máxima é obrigatória";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let config: any;
      if (isComputedStrategy(formData.strategy)) {
        config = {
          expression: formData.expression.trim(),
          questionIds: formData.computedQuestionIds,
          referenceValue: Number(formData.referenceValue),
          maxScore: Number(formData.maxScore),
        };
      } else if (formData.strategy === Strategy.PerOption) {
        const points: Record<string, number> = {};
        Object.entries(formData.optionPoints).forEach(([key, value]) => {
          points[key] = Number(value);
        });
        config = { points };
      } else if (formData.strategy === Strategy.InverseProportional) {
        config = {
          referenceValue: Number(formData.referenceValue),
          maxScore: Number(formData.maxScore),
        };
      } else {
        config = {
          ranges: formData.ranges.map((r) => ({
            min: r.min === "" ? null : Number(r.min),
            max: r.max === "" ? null : Number(r.max),
            points: Number(r.points),
          })),
        };
      }

      const dto: CreateRuleDtoInput = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        strategy: formData.strategy,
        config,
        weight: Number(formData.weight) || 1,
      };

      if (!isComputedStrategy(formData.strategy)) {
        dto.questionId = formData.questionId;
      }

      const newRule = await createRule(dto, token);
      toast.success("Regra criada com sucesso!");
      onSuccess(newRule);
      handleClose?.();
      resetForm();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao criar regra";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  const handleCloseModal = () => {
    resetForm();
    handleClose?.();
  };

  const getExpressionTemplates = (questionCount: number) => {
    const all: { label: string; value: string }[] = [];
    const operators = [" / ", " + ", " - ", " * "];

    if (questionCount >= 2) {
      operators.forEach((op) => {
        all.push({
          label: `Q0${op}Q1`,
          value: `Q0${op}Q1`,
        });
      });
    }

    if (questionCount >= 3) {
      operators.forEach((op1) => {
        operators.forEach((op2) => {
          all.push({
            label: `Q0${op1}Q1${op2}Q2`,
            value: `Q0${op1}Q1${op2}Q2`,
          });
          all.push({
            label: `(Q0${op1}Q1)${op2}Q2`,
            value: `(Q0${op1}Q1)${op2}Q2`,
          });
          all.push({
            label: `Q0${op1}(Q1${op2}Q2)`,
            value: `Q0${op1}(Q1${op2}Q2)`,
          });
        });
      });
    }

    // básicos curados para manter a UI enxuta
    const basicSet = new Set<string>([
      "Q0 / Q1",
      "Q0 + Q1",
      "Q0 - Q1",
      "Q0 * Q1",
      "Q0 / (Q1 + Q2)",
      "(Q0 + Q1) / Q2",
      "Q0 / Q1 + Q2",
    ]);

    const basic = all.filter((t) => basicSet.has(t.value));
    const advanced = all.filter((t) => !basicSet.has(t.value));

    return { basic, advanced };
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleCloseModal()}>
      <DialogContent size="lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Criar Nova Regra</DialogTitle>
          <DialogDescription>
            Configure a regra de pontuação vinculada a uma pergunta do formulário
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="-mx-1 px-1 pt-2">
          <div className="flex flex-col gap-6">
            <Field label="Nome da Regra" required error={errors.name || undefined}>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ex: Pontuação por renda familiar"
              />
            </Field>

            <Field
              label="Descrição"
              required
              error={errors.description || undefined}
            >
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={2}
              />
            </Field>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <Field label="Tipo" required className="flex-1">
                <OptionsSelect
                  value={formData.type}
                  onValueChange={(v) => handleInputChange("type", v)}
                  options={[
                    { value: RuleType.Score, label: "Pontuação" },
                    { value: RuleType.TieBreaker, label: "Desempate" },
                  ]}
                />
              </Field>

              <Field label="Peso" className="sm:w-32">
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  min={1}
                />
              </Field>
            </div>

            {/* Strategy selector - show ComputedInverseProportional option always */}
            <Field label="Modo da Regra">
              <OptionsSelect
                value={isComputedStrategy(formData.strategy) ? "computed" : "single"}
                onValueChange={(v) => {
                  if (v === "computed") {
                    handleStrategyChange(Strategy.ComputedInverseProportional);
                  } else {
                    handleStrategyChange(Strategy.PerOption);
                  }
                }}
                options={[
                  { value: "single", label: "Pergunta Única" },
                  {
                    value: "computed",
                    label: "Proporcional Inversa Calculada (múltiplas perguntas)",
                  },
                ]}
              />
            </Field>

            {/* ==================== SINGLE QUESTION MODE ==================== */}
            {!isComputedStrategy(formData.strategy) && (
              <>
                <Field
                  label="Pergunta Vinculada"
                  required
                  error={errors.questionId || undefined}
                >
                  <OptionsSelect
                    value={formData.questionId}
                    onValueChange={handleQuestionChange}
                    placeholder="Selecione uma pergunta"
                    options={questions.map((q) => ({
                      value: q._id,
                      label: q.text,
                    }))}
                  />
                </Field>

                {selectedQuestion && (
                  <>
                    <Separator />

                    {selectedQuestion.answerType === AnswerType.Number && (
                      <Field label="Estratégia de Pontuação" required>
                        <OptionsSelect
                          value={formData.strategy}
                          onValueChange={(v) => handleInputChange("strategy", v)}
                          options={[
                            { value: Strategy.NumericRange, label: "Faixa Numérica" },
                            {
                              value: Strategy.InverseProportional,
                              label: "Proporcional Inversa",
                            },
                          ]}
                        />
                      </Field>
                    )}

                    {formData.strategy === Strategy.PerOption && selectedQuestion.options && (
                      <div className="grid gap-2">
                        <h3 className="text-label">
                          Pontuação por Opção
                          <span aria-hidden="true" className="ml-0.5 text-destructive">
                            *
                          </span>
                        </h3>
                        {errors.config && (
                          <Alert variant="destructive" title={errors.config} />
                        )}
                        <div className="flex flex-col gap-2">
                          {selectedQuestion.options.map((option) => (
                            <div key={option} className="flex items-center gap-4">
                              <span className="min-w-0 flex-1 break-words text-body">
                                {option}
                              </span>
                              <Input
                                type="number"
                                value={formData.optionPoints[option] ?? "0"}
                                onChange={(e) => handleOptionPointChange(option, e.target.value)}
                                aria-label={`Pontos para ${option}`}
                                className="w-24 shrink-0"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.strategy === Strategy.NumericRange && (
                      <div className="grid gap-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-label">
                            Faixas Numéricas
                            <span aria-hidden="true" className="ml-0.5 text-destructive">
                              *
                            </span>
                          </h3>
                          <Button onClick={addRange} size="sm" variant="outline">
                            <Plus aria-hidden="true" />
                            Adicionar Faixa
                          </Button>
                        </div>
                        {errors.config && (
                          <Alert variant="destructive" title={errors.config} />
                        )}
                        <div className="flex flex-col gap-3">
                          {formData.ranges.map((range, index) => (
                            <div key={index} className="flex items-end gap-2">
                              <Field label="Mín" className="min-w-0 flex-1">
                                <Input
                                  type="number"
                                  value={range.min}
                                  onChange={(e) => updateRange(index, "min", e.target.value)}
                                  placeholder="∞"
                                />
                              </Field>
                              <Field label="Máx" className="min-w-0 flex-1">
                                <Input
                                  type="number"
                                  value={range.max}
                                  onChange={(e) => updateRange(index, "max", e.target.value)}
                                  placeholder="∞"
                                />
                              </Field>
                              <Field label="Pontos" className="w-20 shrink-0 sm:w-24">
                                <Input
                                  type="number"
                                  value={range.points}
                                  onChange={(e) => updateRange(index, "points", e.target.value)}
                                />
                              </Field>
                              {formData.ranges.length > 1 && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  aria-label={`Remover faixa ${index + 1}`}
                                  onClick={() => removeRange(index)}
                                >
                                  <Trash2 aria-hidden="true" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.strategy === Strategy.InverseProportional && (
                      <div className="grid gap-2">
                        <div className="flex items-center gap-1">
                          <h3 className="text-label">
                            Proporcional Inversa
                            <span aria-hidden="true" className="ml-0.5 text-destructive">
                              *
                            </span>
                          </h3>
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  aria-label="Como funciona a proporcional inversa"
                                >
                                  <Info aria-hidden="true" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs whitespace-pre-line">
                                {"Quanto menor o valor informado pelo aluno, maior a pontuação.\n\n" +
                                  "• Valor de Referência: valor limite até o qual o aluno recebe a pontuação máxima (ex: renda de R$ 300).\n" +
                                  "• Pontuação Máxima: pontos atribuídos quando o valor do aluno é igual ou menor que a referência.\n\n" +
                                  "Fórmula: pontuação = máx × min(1, referência ÷ valor do aluno).\n" +
                                  "Exemplo: ref = 300, máx = 10 → aluno com 600 recebe 5pts; aluno com 150 recebe 10pts."}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {errors.config && (
                          <Alert variant="destructive" title={errors.config} />
                        )}
                        <div className="flex flex-col gap-4 sm:flex-row">
                          <Field label="Valor de Referência" className="flex-1">
                            <Input
                              type="number"
                              value={formData.referenceValue}
                              onChange={(e) => handleInputChange("referenceValue", e.target.value)}
                              min={0.01}
                              step="any"
                            />
                          </Field>
                          <Field label="Pontuação Máxima" className="flex-1">
                            <Input
                              type="number"
                              value={formData.maxScore}
                              onChange={(e) => handleInputChange("maxScore", e.target.value)}
                            />
                          </Field>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* ==================== COMPUTED INVERSE PROPORTIONAL MODE ==================== */}
            {isComputedStrategy(formData.strategy) && (
              <>
                <Separator />

                <div className="grid gap-2">
                  <div className="flex items-center gap-1">
                    <h3 className="text-label">
                      Proporcional Inversa Calculada
                      <span aria-hidden="true" className="ml-0.5 text-destructive">
                        *
                      </span>
                    </h3>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Como funciona a proporcional inversa calculada"
                          >
                            <Info aria-hidden="true" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm whitespace-pre-line">
                          {"Combina respostas de múltiplas perguntas numéricas usando uma expressão matemática, e aplica proporcionalidade inversa ao resultado.\n\n" +
                            "Exemplo: Renda per capita = Renda familiar (Q0) / Nº de pessoas (Q1).\n" +
                            "Com ref = 750, máx = 10:\n" +
                            "• Aluno com renda 3000 e 4 pessoas → 3000/4 = 750 → 10pts\n" +
                            "• Aluno com renda 5000 e 2 pessoas → 5000/2 = 2500 → 3pts"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {errors.questionId && (
                    <Alert variant="destructive" title={errors.questionId} />
                  )}

                  {/* Selected questions list */}
                  <div className="flex flex-col gap-2">
                    {formData.computedQuestionIds.map((qId, index) => {
                      const q = questions.find((q) => q._id === qId);
                      return (
                        <div key={qId} className="flex items-center gap-2">
                          <Badge variant="outline">{`Q${index}`}</Badge>
                          <span className="min-w-0 flex-1 break-words text-body">
                            {q?.text ?? qId}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Remover Q${index}`}
                            onClick={() => removeComputedQuestion(index)}
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add question dropdown (limit 3 questions) */}
                  {formData.computedQuestionIds.length < 3 &&
                    numericQuestions.filter((q) => !formData.computedQuestionIds.includes(q._id)).length > 0 && (
                    <OptionsSelect
                      aria-label="Adicionar pergunta numérica"
                      value=""
                      onValueChange={addComputedQuestion}
                      placeholder="Adicionar pergunta numérica..."
                      options={numericQuestions
                        .filter((q) => !formData.computedQuestionIds.includes(q._id))
                        .map((q) => ({ value: q._id, label: q.text }))}
                    />
                  )}
                </div>

                {/* Expression field */}
                {formData.computedQuestionIds.length >= 2 && (
                  <div className="grid gap-2">
                    <h3 className="text-label">
                      Expressão Matemática
                      <span aria-hidden="true" className="ml-0.5 text-destructive">
                        *
                      </span>
                    </h3>
                    {(() => {
                      const { basic, advanced } = getExpressionTemplates(
                        formData.computedQuestionIds.length
                      );
                      const chip = (t: { label: string; value: string }) => (
                        <Button
                          key={t.value}
                          size="sm"
                          variant={formData.expression === t.value ? "primary" : "outline"}
                          aria-pressed={formData.expression === t.value}
                          onClick={() => handleInputChange("expression", t.value)}
                        >
                          {t.label}
                        </Button>
                      );
                      return (
                        <>
                          <p className="text-caption text-muted-foreground">
                            Sugestões principais
                          </p>
                          <div className="flex flex-wrap gap-2">{basic.map(chip)}</div>
                          {advanced.length > 0 && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="justify-start px-0"
                                onClick={() => setShowAdvancedExpressions((prev) => !prev)}
                              >
                                {showAdvancedExpressions
                                  ? "Ocultar combinações avançadas"
                                  : "Mostrar combinações avançadas"}
                              </Button>
                              {showAdvancedExpressions && (
                                <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto pr-1">
                                  {advanced.map(chip)}
                                </div>
                              )}
                            </>
                          )}
                        </>
                      );
                    })()}
                    <Input
                      value={formData.expression}
                      placeholder="Q0 / Q1"
                      readOnly
                      aria-label="Expressão Matemática"
                    />
                    {/* Legend */}
                    <div>
                      {formData.computedQuestionIds.map((qId, i) => {
                        const q = questions.find((q) => q._id === qId);
                        return (
                          <p key={qId} className="text-caption text-muted-foreground">
                            Q{i} = {q?.text ?? qId}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Reference value and max score */}
                {errors.config && (
                  <Alert variant="destructive" title={errors.config} />
                )}
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Field label="Valor de Referência" className="flex-1">
                    <Input
                      type="number"
                      value={formData.referenceValue}
                      onChange={(e) => handleInputChange("referenceValue", e.target.value)}
                      min={0.01}
                      step="any"
                    />
                  </Field>
                  <Field label="Pontuação Máxima" className="flex-1">
                    <Input
                      type="number"
                      value={formData.maxScore}
                      onChange={(e) => handleInputChange("maxScore", e.target.value)}
                    />
                  </Field>
                </div>
              </>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button onClick={handleCloseModal} variant="outline" disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="primary" loading={loading}>
            {loading ? "Criando..." : "Criar Regra"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
