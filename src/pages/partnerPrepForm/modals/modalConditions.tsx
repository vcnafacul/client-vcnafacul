import ModalTemplate, {
  ModalProps,
} from "@/components/templates/modalTemplate";
import {
  ComplexCondition,
  Logic,
  Operator,
} from "@/types/partnerPrepForm/condition";
import { AnswerType, QuestionForm } from "@/types/partnerPrepForm/questionForm";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { memo, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";

interface ModalConditionsProps extends ModalProps {
  isOpen: boolean;
  conditions?: ComplexCondition;
  availableQuestions: QuestionForm[];
  onSave: (conditions: ComplexCondition) => void;
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
          <TextField
            label="Valor esperado"
            placeholder="Digite o texto..."
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            fullWidth
            error={error}
            helperText={helperText}
          />
        );

      case AnswerType.Number:
        return (
          <TextField
            type="number"
            label="Valor esperado"
            placeholder="Digite um número..."
            value={String(value)}
            onChange={(e) => onChange(Number(e.target.value))}
            fullWidth
            error={error}
            helperText={helperText}
            inputProps={{ min: 0, step: 1 }}
          />
        );

      case AnswerType.Boolean:
        return (
          <FormControl fullWidth error={error}>
            <FormLabel>Valor esperado</FormLabel>
            <RadioGroup
              value={String(value)}
              onChange={(e) => onChange(e.target.value === "true")}
            >
              <FormControlLabel value="true" control={<Radio />} label="Sim" />
              <FormControlLabel value="false" control={<Radio />} label="Não" />
            </RadioGroup>
            {helperText && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {helperText}
              </Typography>
            )}
          </FormControl>
        );

      case AnswerType.Options:
        return (
          <FormControl fullWidth error={error}>
            <InputLabel>Valor esperado</InputLabel>
            <Select
              value={String(value)}
              onChange={(e) => onChange(e.target.value)}
              label="Valor esperado"
            >
              {questionOptions?.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {helperText && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {helperText}
              </Typography>
            )}
          </FormControl>
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
}: ModalConditionsProps) {
  // Filtrar apenas questões ativas para referência
  const activeQuestions = availableQuestions.filter(
    (question) => question.active
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
      prev.map((condition, i) =>
        i === index ? { ...condition, [field]: value } : condition
      )
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
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleCloseModal}
      className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Definir Condições
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure as condições que devem ser atendidas para exibir esta
          questão
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Operador Principal */}
        <FormControl>
          <FormLabel component="legend">Operador Principal</FormLabel>
          <RadioGroup
            value={mainOperator}
            onChange={(e) => setMainOperator(e.target.value as Logic)}
            row
          >
            <FormControlLabel
              value={Logic.And}
              control={<Radio />}
              label="E (todas as condições)"
            />
            <FormControlLabel
              value={Logic.Or}
              control={<Radio />}
              label="OU (qualquer condição)"
            />
          </RadioGroup>
        </FormControl>

        <Divider />

        {/* Lista de Condições */}
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Condições</Typography>
            <Button
              startIcon={<FiPlus />}
              onClick={addCondition}
              size="small"
              variant="outlined"
            >
              Adicionar Condição
            </Button>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {conditionList.map((condition, index) => {
              const selectedQuestion = getSelectedQuestion(
                condition.questionId
              );
              const availableOperators = selectedQuestion
                ? getOperatorsForType(selectedQuestion.answerType)
                : [];

              return (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "grey.300",
                    borderRadius: 2,
                    backgroundColor: "grey.50",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">
                      Condição {index + 1}
                    </Typography>
                    {conditionList.length > 1 && (
                      <IconButton
                        onClick={() => removeCondition(index)}
                        color="error"
                        size="small"
                      >
                        <FiTrash2 />
                      </IconButton>
                    )}
                  </Box>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {/* Seleção da Questão */}
                    <FormControl
                      fullWidth
                      error={!!errors[`${index}-questionId`]}
                    >
                      <InputLabel>Questão de Referência</InputLabel>
                      <Select
                        value={condition.questionId}
                        onChange={(e) =>
                          updateCondition(index, "questionId", e.target.value)
                        }
                        label="Questão de Referência"
                      >
                        {activeQuestions.length > 0 ? (
                          activeQuestions.map((question) => (
                            <MenuItem key={question._id} value={question._id}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Chip
                                  label={question.answerType}
                                  size="small"
                                  variant="outlined"
                                />
                                <Typography variant="body2">
                                  {question.text.slice(0, 50)}...
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>
                            <Typography variant="body2" color="text.secondary">
                              Nenhuma questão ativa disponível
                            </Typography>
                          </MenuItem>
                        )}
                      </Select>
                      {errors[`${index}-questionId`] && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 1 }}
                        >
                          {errors[`${index}-questionId`]}
                        </Typography>
                      )}
                    </FormControl>

                    {/* Seleção do Operador */}
                    {selectedQuestion && (
                      <FormControl
                        fullWidth
                        error={!!errors[`${index}-operator`]}
                      >
                        <InputLabel>Operador</InputLabel>
                        <Select
                          value={condition.operator}
                          onChange={(e) =>
                            updateCondition(index, "operator", e.target.value)
                          }
                          label="Operador"
                        >
                          {availableOperators.map((op) => (
                            <MenuItem key={op.value} value={op.value}>
                              {op.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors[`${index}-operator`] && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 1 }}
                          >
                            {errors[`${index}-operator`]}
                          </Typography>
                        )}
                      </FormControl>
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
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Botões de Ação */}
        <Box
          sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}
        >
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Salvando..." : "Salvar Condições"}
          </Button>
        </Box>
      </Box>
    </ModalTemplate>
  );
}
