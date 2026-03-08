import ModalTemplate, {
  ModalProps,
} from "@/components/templates/modalTemplate";
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
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormLabel,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { FiInfo, FiPlus, FiTrash2 } from "react-icons/fi";
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
    setFormData((prev) => ({
      ...prev,
      computedQuestionIds: [...prev.computedQuestionIds, questionId],
    }));
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

  const expressionTemplates = [
    { label: "Q0 / Q1", value: "Q0 / Q1" },
    { label: "Q0 + Q1", value: "Q0 + Q1" },
    { label: "Q0 - Q1", value: "Q0 - Q1" },
    { label: "(Q0 + Q1) / Q2", value: "(Q0 + Q1) / Q2" },
  ];

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleCloseModal}
      className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Criar Nova Regra
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure a regra de pontuação vinculada a uma pergunta do formulário
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <TextField
          label="Nome da Regra *"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
          fullWidth
          variant="outlined"
          placeholder="Ex: Pontuação por renda familiar"
        />

        <TextField
          label="Descrição *"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          error={!!errors.description}
          helperText={errors.description}
          multiline
          rows={2}
          fullWidth
          variant="outlined"
        />

        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          <TextField
            label="Tipo *"
            select
            value={formData.type}
            onChange={(e) => handleInputChange("type", e.target.value)}
            fullWidth
            variant="outlined"
          >
            <MenuItem value={RuleType.Score}>Pontuação</MenuItem>
            <MenuItem value={RuleType.TieBreaker}>Desempate</MenuItem>
          </TextField>

          <TextField
            label="Peso"
            type="number"
            value={formData.weight}
            onChange={(e) => handleInputChange("weight", e.target.value)}
            variant="outlined"
            sx={{ width: 120 }}
            inputProps={{ min: 1 }}
          />
        </Box>

        {/* Strategy selector - show ComputedInverseProportional option always */}
        <TextField
          label="Modo da Regra"
          select
          value={isComputedStrategy(formData.strategy) ? "computed" : "single"}
          onChange={(e) => {
            if (e.target.value === "computed") {
              handleStrategyChange(Strategy.ComputedInverseProportional);
            } else {
              handleStrategyChange(Strategy.PerOption);
            }
          }}
          fullWidth
          variant="outlined"
        >
          <MenuItem value="single">Pergunta Única</MenuItem>
          <MenuItem value="computed">Proporcional Inversa Calculada (múltiplas perguntas)</MenuItem>
        </TextField>

        {/* ==================== SINGLE QUESTION MODE ==================== */}
        {!isComputedStrategy(formData.strategy) && (
          <>
            <FormControl fullWidth error={!!errors.questionId}>
              <FormLabel>Pergunta Vinculada *</FormLabel>
              <Select
                value={formData.questionId}
                onChange={(e) => handleQuestionChange(e.target.value)}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Selecione uma pergunta
                </MenuItem>
                {questions.map((q) => (
                  <MenuItem key={q._id} value={q._id}>
                    {q.text}
                  </MenuItem>
                ))}
              </Select>
              {errors.questionId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.questionId}
                </Typography>
              )}
            </FormControl>

            {selectedQuestion && (
              <>
                <Divider />

                {selectedQuestion.answerType === AnswerType.Number && (
                  <TextField
                    label="Estratégia de Pontuação *"
                    select
                    value={formData.strategy}
                    onChange={(e) => handleInputChange("strategy", e.target.value)}
                    fullWidth
                    variant="outlined"
                  >
                    <MenuItem value={Strategy.NumericRange}>Faixa Numérica</MenuItem>
                    <MenuItem value={Strategy.InverseProportional}>Proporcional Inversa</MenuItem>
                  </TextField>
                )}

                {formData.strategy === Strategy.PerOption && selectedQuestion.options && (
                  <Box>
                    <FormLabel>Pontuação por Opção *</FormLabel>
                    {errors.config && (
                      <Alert severity="error" sx={{ my: 1 }}>
                        {errors.config}
                      </Alert>
                    )}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
                      {selectedQuestion.options.map((option) => (
                        <Box key={option} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                          <Typography sx={{ flex: 1, fontSize: "0.875rem" }}>
                            {option}
                          </Typography>
                          <TextField
                            type="number"
                            value={formData.optionPoints[option] ?? "0"}
                            onChange={(e) => handleOptionPointChange(option, e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{ width: 100 }}
                            label="Pontos"
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {formData.strategy === Strategy.NumericRange && (
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <FormLabel>Faixas Numéricas *</FormLabel>
                      <Button startIcon={<FiPlus />} onClick={addRange} size="small" variant="outlined">
                        Adicionar Faixa
                      </Button>
                    </Box>
                    {errors.config && (
                      <Alert severity="error" sx={{ mb: 1 }}>
                        {errors.config}
                      </Alert>
                    )}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {formData.ranges.map((range, index) => (
                        <Box key={index} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                          <TextField
                            type="number"
                            value={range.min}
                            onChange={(e) => updateRange(index, "min", e.target.value)}
                            variant="outlined"
                            size="small"
                            label="Mín"
                            placeholder="∞"
                            sx={{ flex: 1 }}
                          />
                          <TextField
                            type="number"
                            value={range.max}
                            onChange={(e) => updateRange(index, "max", e.target.value)}
                            variant="outlined"
                            size="small"
                            label="Máx"
                            placeholder="∞"
                            sx={{ flex: 1 }}
                          />
                          <TextField
                            type="number"
                            value={range.points}
                            onChange={(e) => updateRange(index, "points", e.target.value)}
                            variant="outlined"
                            size="small"
                            label="Pontos"
                            sx={{ width: 100 }}
                          />
                          {formData.ranges.length > 1 && (
                            <IconButton onClick={() => removeRange(index)} color="error" size="small">
                              <FiTrash2 />
                            </IconButton>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {formData.strategy === Strategy.InverseProportional && (
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <FormLabel>Proporcional Inversa *</FormLabel>
                      <Tooltip
                        title={
                          "Quanto menor o valor informado pelo aluno, maior a pontuação.\n\n" +
                          "• Valor de Referência: valor limite até o qual o aluno recebe a pontuação máxima (ex: renda de R$ 300).\n" +
                          "• Pontuação Máxima: pontos atribuídos quando o valor do aluno é igual ou menor que a referência.\n\n" +
                          "Fórmula: pontuação = máx × min(1, referência ÷ valor do aluno).\n" +
                          "Exemplo: ref = 300, máx = 10 → aluno com 600 recebe 5pts; aluno com 150 recebe 10pts."
                        }
                        enterTouchDelay={0}
                        leaveTouchDelay={5000}
                        arrow
                        slotProps={{
                          tooltip: {
                            sx: { whiteSpace: "pre-line", maxWidth: 320, fontSize: "0.8rem" },
                          },
                        }}
                      >
                        <IconButton size="small" sx={{ color: "info.main" }}>
                          <FiInfo size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    {errors.config && (
                      <Alert severity="error" sx={{ my: 1 }}>
                        {errors.config}
                      </Alert>
                    )}
                    <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                      <TextField
                        type="number"
                        value={formData.referenceValue}
                        onChange={(e) => handleInputChange("referenceValue", e.target.value)}
                        variant="outlined"
                        label="Valor de Referência"
                        inputProps={{ min: 0.01, step: "any" }}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        type="number"
                        value={formData.maxScore}
                        onChange={(e) => handleInputChange("maxScore", e.target.value)}
                        variant="outlined"
                        label="Pontuação Máxima"
                        sx={{ flex: 1 }}
                      />
                    </Box>
                  </Box>
                )}
              </>
            )}
          </>
        )}

        {/* ==================== COMPUTED INVERSE PROPORTIONAL MODE ==================== */}
        {isComputedStrategy(formData.strategy) && (
          <>
            <Divider />

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                <FormLabel>Proporcional Inversa Calculada *</FormLabel>
                <Tooltip
                  title={
                    "Combina respostas de múltiplas perguntas numéricas usando uma expressão matemática, e aplica proporcionalidade inversa ao resultado.\n\n" +
                    "Exemplo: Renda per capita = Renda familiar (Q0) / Nº de pessoas (Q1).\n" +
                    "Com ref = 750, máx = 10:\n" +
                    "• Aluno com renda 3000 e 4 pessoas → 3000/4 = 750 → 10pts\n" +
                    "• Aluno com renda 5000 e 2 pessoas → 5000/2 = 2500 → 3pts"
                  }
                  enterTouchDelay={0}
                  leaveTouchDelay={5000}
                  arrow
                  slotProps={{
                    tooltip: {
                      sx: { whiteSpace: "pre-line", maxWidth: 360, fontSize: "0.8rem" },
                    },
                  }}
                >
                  <IconButton size="small" sx={{ color: "info.main" }}>
                    <FiInfo size={16} />
                  </IconButton>
                </Tooltip>
              </Box>

              {errors.questionId && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {errors.questionId}
                </Alert>
              )}

              {/* Selected questions list */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 1 }}>
                {formData.computedQuestionIds.map((qId, index) => {
                  const q = questions.find((q) => q._id === qId);
                  return (
                    <Box key={qId} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={`Q${index}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {q?.text ?? qId}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeComputedQuestion(index)}
                      >
                        <FiTrash2 size={14} />
                      </IconButton>
                    </Box>
                  );
                })}
              </Box>

              {/* Add question dropdown */}
              {numericQuestions.filter((q) => !formData.computedQuestionIds.includes(q._id)).length > 0 && (
                <FormControl fullWidth size="small">
                  <Select
                    value=""
                    onChange={(e) => addComputedQuestion(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Adicionar pergunta numérica...
                    </MenuItem>
                    {numericQuestions
                      .filter((q) => !formData.computedQuestionIds.includes(q._id))
                      .map((q) => (
                        <MenuItem key={q._id} value={q._id}>
                          {q.text}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )}
            </Box>

            {/* Expression field */}
            {formData.computedQuestionIds.length >= 2 && (
              <Box>
                <FormLabel>Expressão Matemática *</FormLabel>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", my: 1 }}>
                  {expressionTemplates
                    .filter((t) => {
                      const maxQ = formData.computedQuestionIds.length - 1;
                      const vars = t.value.match(/Q(\d+)/g) ?? [];
                      return vars.every((v) => parseInt(v.slice(1)) <= maxQ);
                    })
                    .map((t) => (
                      <Chip
                        key={t.value}
                        label={t.label}
                        size="small"
                        variant="outlined"
                        clickable
                        onClick={() => handleInputChange("expression", t.value)}
                        color={formData.expression === t.value ? "primary" : "default"}
                      />
                    ))}
                </Box>
                <TextField
                  value={formData.expression}
                  onChange={(e) => handleInputChange("expression", e.target.value)}
                  variant="outlined"
                  fullWidth
                  placeholder="Q0 / Q1"
                  size="small"
                />
                {/* Legend */}
                <Box sx={{ mt: 0.5 }}>
                  {formData.computedQuestionIds.map((qId, i) => {
                    const q = questions.find((q) => q._id === qId);
                    return (
                      <Typography key={qId} variant="caption" color="text.secondary" display="block">
                        Q{i} = {q?.text ?? qId}
                      </Typography>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Reference value and max score */}
            {errors.config && (
              <Alert severity="error">
                {errors.config}
              </Alert>
            )}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                type="number"
                value={formData.referenceValue}
                onChange={(e) => handleInputChange("referenceValue", e.target.value)}
                variant="outlined"
                label="Valor de Referência"
                inputProps={{ min: 0.01, step: "any" }}
                sx={{ flex: 1 }}
              />
              <TextField
                type="number"
                value={formData.maxScore}
                onChange={(e) => handleInputChange("maxScore", e.target.value)}
                variant="outlined"
                label="Pontuação Máxima"
                sx={{ flex: 1 }}
              />
            </Box>
          </>
        )}

        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={handleCloseModal} variant="outlined" disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Criando..." : "Criar Regra"}
          </Button>
        </Box>
      </Box>
    </ModalTemplate>
  );
}
