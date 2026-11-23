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
import {
  ComplexCondition,
  Logic,
  Operator,
} from "@/types/partnerPrepForm/condition";
import { AnswerType, QuestionForm } from "@/types/partnerPrepForm/questionForm";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { OptionsSelect } from "@/components/ui/options-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { memo, useState } from "react";
import { resumo, ROTULO_DO_TIPO } from "../textosDeCondicao";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";

interface ModalConditionsProps extends ModalProps {
  isOpen: boolean;
  conditions?: ComplexCondition;
  availableQuestions: QuestionForm[];
  onSave: (conditions: ComplexCondition) => void;
  /** A questão sendo editada: não pode ser referência dela mesma (card 27). */
  questaoId?: string;
}

interface ConditionFormData {
  questionId: string;
  operator: Operator;
  expectedValue: string | number | boolean;
}

const initialConditionData: ConditionFormData = {
  questionId: "",
  operator: Operator.Equal,
  expectedValue: "",
};

// Componente para input de valor esperado baseado no tipo (memoizado)
const ExpectedValueInput = memo(
  ({
    questionType,
    questionOptions,
    value,
    onChange,
    error,
    helperText,
  }: {
    questionType: AnswerType;
    questionOptions?: string[];
    value: string | number | boolean;
    onChange: (value: string | number | boolean) => void;
    error?: boolean;
    helperText?: string;
  }) => {
    switch (questionType) {
      case AnswerType.Text:
        return (
          <Field label="Valor esperado" error={helperText}>
            <Input
              placeholder="Digite o texto..."
              value={String(value)}
              onChange={(e) => onChange(e.target.value)}
            />
          </Field>
        );

      case AnswerType.Number:
        return (
          <Field label="Valor esperado" error={helperText}>
            <Input
              type="number"
              placeholder="Digite um número..."
              value={String(value)}
              // Vazio fica vazio (a validação pega), em vez de virar 0 (card 27)
              onChange={(e) =>
                onChange(e.target.value === "" ? "" : Number(e.target.value))
              }
              min={0}
              step={1}
            />
          </Field>
        );

      case AnswerType.Boolean:
        return (
          <fieldset className="grid gap-1.5">
            <legend className="mb-1.5 text-label">Valor esperado</legend>
            <RadioGroup
              value={value === "" ? "" : String(value)}
              onValueChange={(v) => onChange(v === "true")}
              aria-invalid={error || undefined}
            >
              <RadioGroupItem value="true" label="Sim" />
              <RadioGroupItem value="false" label="Não" />
            </RadioGroup>
            {helperText && (
              <p className="text-caption text-destructive">{helperText}</p>
            )}
          </fieldset>
        );

      case AnswerType.Options:
        return (
          <Field label="Valor esperado" error={helperText}>
            <OptionsSelect
              value={String(value)}
              onValueChange={(v) => onChange(v)}
              options={(questionOptions ?? []).map((option) => ({
                value: option,
                label: option,
              }))}
            />
          </Field>
        );

      default:
        return null;
    }
  }
);

export function ModalConditions({
  isOpen,
  handleClose,
  conditions,
  availableQuestions,
  onSave,
  questaoId,
}: ModalConditionsProps) {
  // Só ativas, e nunca a própria questão (card 27)
  const activeQuestions = availableQuestions.filter(
    (question) => question.active && question._id !== questaoId
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mainOperator, setMainOperator] = useState<Logic>(conditions?.logic || Logic.And);
  const [conditionList, setConditionList] = useState<ConditionFormData[]>(
    conditions?.conditions || [initialConditionData]
  );

  // Função para obter operadores baseado no tipo de questão
  const getOperatorsForType = (questionType: AnswerType) => {
    switch (questionType) {
      case AnswerType.Text:
        return [
          { value: "Equal", label: "Igual a" },
          { value: "NotEqual", label: "Diferente de" },
          { value: "Contains", label: "Contém" },
        ];

      case AnswerType.Number:
        return [
          { value: "Equal", label: "Igual a" },
          { value: "NotEqual", label: "Diferente de" },
          { value: "GreaterThan", label: "Maior que" },
          { value: "GreaterThanOrEqual", label: "Maior ou igual a" },
          { value: "LessThan", label: "Menor que" },
          { value: "LessThanOrEqual", label: "Menor ou igual a" },
        ];

      case AnswerType.Boolean:
        return [
          { value: "Equal", label: "É" },
          { value: "NotEqual", label: "Não é" },
        ];

      case AnswerType.Options:
        return [
          { value: "Equal", label: "Igual a" },
          { value: "NotEqual", label: "Diferente de" },
          { value: "Contains", label: "Contém" },
        ];

      default:
        return [];
    }
  };

  // Função para obter a questão selecionada
  const getSelectedQuestion = (
    questionId: string
  ): QuestionForm | undefined => {
    return activeQuestions.find((q) => q._id === questionId);
  };

  // Função para validar valor baseado no tipo
  const validateValue = (
    value: string | number | boolean,
    questionType: AnswerType
  ): boolean => {
    // Verificar se o valor está vazio
    if (value === "" || value === null || value === undefined) return false;

    switch (questionType) {
      case AnswerType.Number:
        return typeof value === "number" || !isNaN(Number(value));
      case AnswerType.Boolean:
        return (
          typeof value === "boolean" || value === "true" || value === "false"
        );
      case AnswerType.Text:
        return typeof value === "string" && value.trim().length > 0;
      case AnswerType.Options:
        return typeof value === "string" && value.trim().length > 0;
      default:
        return true;
    }
  };

  const addCondition = () => {
    setConditionList((prev) => [...prev, { ...initialConditionData }]);
  };

  const removeCondition = (index: number) => {
    if (conditionList.length > 1) {
      setConditionList((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateCondition = (
    index: number,
    field: keyof ConditionFormData,
    value: string
  ) => {
    setConditionList((prev) =>
      prev.map((condition, i) => {
        if (i !== index) return condition;
        // Trocar a referência limpa operador e valor: "Maior que 18" não
        // serve para uma questão de Texto (card 27).
        if (field === "questionId" && value !== condition.questionId) {
          return {
            ...condition,
            questionId: value,
            operator: Operator.Equal,
            expectedValue: "",
          };
        }
        return { ...condition, [field]: value };
      })
    );

    // Limpar erro do campo quando usuário começar a digitar
    if (errors[`${index}-${field}`]) {
      setErrors((prev) => ({ ...prev, [`${index}-${field}`]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    conditionList.forEach((condition, index) => {
      if (!condition.questionId) {
        newErrors[`${index}-questionId`] = "Selecione uma questão";
      } else {
        // Verificar se a questão selecionada está ativa
        const selectedQuestion = getSelectedQuestion(condition.questionId);
        if (!selectedQuestion) {
          newErrors[`${index}-questionId`] =
            "Questão não encontrada ou inativa";
        }
      }

      if (!condition.operator) {
        newErrors[`${index}-operator`] = "Selecione um operador";
      }

      if (!condition.expectedValue || condition.expectedValue === "") {
        newErrors[`${index}-expectedValue`] = "Valor esperado é obrigatório";
      } else {
        const selectedQuestion = getSelectedQuestion(condition.questionId);
        if (
          selectedQuestion &&
          !validateValue(condition.expectedValue, selectedQuestion.answerType)
        ) {
          newErrors[`${index}-expectedValue`] =
            "Valor inválido para este tipo de questão";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const complexCondition: ComplexCondition = {
        logic: mainOperator,
        conditions: conditionList.map((condition) => ({
          questionId: condition.questionId,
          operator: condition.operator as Operator,
          expectedValue: condition.expectedValue,
        })),
      };

      onSave(complexCondition);
      toast.success("Condições salvas com sucesso!");
      handleClose?.();
    } catch (error) {
      toast.error("Erro ao salvar condições");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setConditionList(conditions?.conditions || [initialConditionData]);
    setMainOperator(conditions?.logic || Logic.And);
    setErrors({});
    handleClose?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleCloseModal()}>
      <DialogContent
        size="lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Definir Condições</DialogTitle>
          <DialogDescription>
            Configure as condições que devem ser atendidas para exibir esta
          questão
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="-mx-1 px-1 pt-2">
          <div className="flex flex-col gap-6">
            {/* Operador Principal */}
            <fieldset className="grid gap-1.5">
              <legend className="mb-1.5 text-label">Operador Principal</legend>
              <RadioGroup
                value={mainOperator}
                onValueChange={(v) => setMainOperator(v as Logic)}
                className="sm:grid-flow-col sm:justify-start sm:gap-6"
              >
                <RadioGroupItem
                  value={Logic.And}
                  label="E (todas as condições)"
                />
                <RadioGroupItem
                  value={Logic.Or}
                  label="OU (qualquer condição)"
                />
              </RadioGroup>
            </fieldset>

            <Separator />

            {/* Lista de Condições */}
            <div>
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-h4">Condições</h3>
                <Button onClick={addCondition} size="sm" variant="outline">
                  <Plus aria-hidden="true" />
                  Adicionar Condição
                </Button>
              </div>

              <div className="flex flex-col gap-6">
                {conditionList.map((condition, index) => {
                  const selectedQuestion = getSelectedQuestion(
                    condition.questionId
                  );
                  const availableOperators = selectedQuestion
                    ? getOperatorsForType(selectedQuestion.answerType)
                    : [];

                  return (
                    <div
                      key={index}
                      className="rounded-lg border border-border bg-muted p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-2">
                        <h4 className="text-label">Condição {index + 1}</h4>
                        {conditionList.length > 1 && (
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Remover condição ${index + 1}`}
                            onClick={() => removeCondition(index)}
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        )}
                      </div>

                      <div className="flex flex-col gap-4">
                        {/* Seleção da Questão */}
                        <Field
                          label="Questão de Referência"
                          error={errors[`${index}-questionId`] || undefined}
                        >
<OptionsSelect
                            value={condition.questionId}
                            onValueChange={(v) =>
                              updateCondition(index, "questionId", v)
                            }
                            options={activeQuestions.map((question) => ({
                              value: question._id,
                              label: `${ROTULO_DO_TIPO[question.answerType]} · ${resumo(question.text)}`,
                            }))}
                          />
                        </Field>

                        {/* Seleção do Operador */}
                        {selectedQuestion && (
                          <Field
                            label="Operador"
                            error={errors[`${index}-operator`] || undefined}
                          >
                            <OptionsSelect
                              value={condition.operator}
                              onValueChange={(v) =>
                                updateCondition(index, "operator", v)
                              }
                              options={availableOperators}
                            />
                          </Field>
                        )}

                        {/* Input de Valor Esperado */}
                        {selectedQuestion && condition.operator && (
                          <ExpectedValueInput
                            questionType={selectedQuestion.answerType}
                            questionOptions={selectedQuestion.options}
                            value={condition.expectedValue}
                            onChange={(value) =>
                              updateCondition(index, "expectedValue", String(value))
                            }
                            error={!!errors[`${index}-expectedValue`]}
                            helperText={errors[`${index}-expectedValue`]}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            onClick={handleCloseModal}
            variant="outline"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="primary" loading={loading}>
            {loading ? "Salvando..." : "Salvar Condições"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
