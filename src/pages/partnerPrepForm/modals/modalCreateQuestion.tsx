import ModalTemplate, {
  ModalProps,
} from "@/components/templates/modalTemplate";
import { createQuestion } from "@/services/partnerPrepForm/createQuestion";
import { useAuthStore } from "@/store/auth";
import {
  AnswerCollectionType,
  AnswerType,
  QuestionForm,
} from "@/types/partnerPrepForm/questionForm";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";

interface ModalCreateQuestionProps extends ModalProps {
  isOpen: boolean;
  sectionId: string;
  onSuccess: (question: QuestionForm) => void;
}

interface FormData {
  text: string;
  helpText: string;
  answerType: AnswerType;
  collection: AnswerCollectionType;
  options: string[];
  active: boolean;
}

const initialFormData: FormData = {
  text: "",
  helpText: "",
  answerType: AnswerType.Text,
  collection: AnswerCollectionType.Single,
  options: [""],
  active: true,
};

export function ModalCreateQuestion({
  isOpen,
  handleClose,
  sectionId,
  onSuccess,
}: ModalCreateQuestionProps) {
  const {
    data: { token },
  } = useAuthStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean | AnswerCollectionType
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAnswerTypeChange = (newAnswerType: AnswerType) => {
    setFormData((prev) => ({
      ...prev,
      answerType: newAnswerType,
      // Reset collection e options quando mudar o tipo
      collection: AnswerCollectionType.Single,
      options: newAnswerType === AnswerType.Options ? [""] : [],
    }));
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 1) {
      setFormData((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((option, i) => (i === index ? value : option)),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.text.trim()) {
      newErrors.text = "O texto da pergunta é obrigatório";
    }

    if (formData.answerType === AnswerType.Options) {
      const validOptions = formData.options.filter(
        (option) => option.trim() !== ""
      );
      if (validOptions.length === 0) {
        newErrors.options = "Pelo menos uma opção é obrigatória";
      } else if (validOptions.length < 2) {
        newErrors.options = "Pelo menos duas opções são necessárias";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const validOptions =
        formData.answerType === AnswerType.Options
          ? formData.options.filter((option) => option.trim() !== "")
          : undefined;

      const questionData = {
        sectionId,
        text: formData.text.trim(),
        helpText: formData.helpText.trim() || undefined,
        answerType: formData.answerType,
        collection: formData.collection,
        options: validOptions,
        active: formData.active,
      };

      const newQuestion = await createQuestion(questionData, token);
      toast.success("Questão criada com sucesso!");
      onSuccess(newQuestion);
      handleClose?.();
      resetForm();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao criar questão";
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

  const isOptionsType = formData.answerType === AnswerType.Options;

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleCloseModal}
      className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Criar Nova Questão
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Preencha os dados da questão para a seção
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Texto da Pergunta */}
        <TextField
          label="Texto da Pergunta *"
          value={formData.text}
          onChange={(e) => handleInputChange("text", e.target.value)}
          error={!!errors.text}
          helperText={errors.text}
          multiline
          rows={3}
          fullWidth
          variant="outlined"
        />

        {/* Help Text */}
        <TextField
          label="Texto de Ajuda (Opcional)"
          value={formData.helpText}
          onChange={(e) => handleInputChange("helpText", e.target.value)}
          multiline
          rows={2}
          fullWidth
          variant="outlined"
          helperText="Texto adicional que aparecerá para ajudar o usuário"
        />

        {/* Tipo de Resposta */}
        <FormControl fullWidth>
          <FormLabel component="legend">Tipo de Resposta *</FormLabel>
          <Select
            value={formData.answerType}
            onChange={(e) =>
              handleAnswerTypeChange(e.target.value as AnswerType)
            }
            fullWidth
          >
            <MenuItem value={AnswerType.Text}>Texto</MenuItem>
            <MenuItem value={AnswerType.Number}>Número</MenuItem>
            <MenuItem value={AnswerType.Boolean}>Sim/Não</MenuItem>
            <MenuItem value={AnswerType.Options}>Opções (Dropdown)</MenuItem>
          </Select>
        </FormControl>

        {/* Collection Type - Só aparece para Options */}
        {isOptionsType && (
          <FormControl>
            <FormLabel component="legend">Tipo de Seleção *</FormLabel>
            <RadioGroup
              value={formData.collection}
              onChange={(e) =>
                handleInputChange(
                  "collection",
                  e.target.value as AnswerCollectionType
                )
              }
              row
            >
              <FormControlLabel
                value={AnswerCollectionType.Single}
                control={<Radio />}
                label="Resposta Única"
              />
              <FormControlLabel
                value={AnswerCollectionType.Multiple}
                control={<Radio />}
                label="Múltiplas Respostas"
              />
            </RadioGroup>
          </FormControl>
        )}

        {/* Opções - Só aparece para Options */}
        {isOptionsType && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <FormLabel component="legend">Opções de Resposta *</FormLabel>
              <Button
                startIcon={<FiPlus />}
                onClick={addOption}
                size="small"
                variant="outlined"
              >
                Adicionar Opção
              </Button>
            </Box>

            {errors.options && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.options}
              </Alert>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {formData.options.map((option, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", gap: 1, alignItems: "center" }}
                >
                  <TextField
                    label={`Opção ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                  {formData.options.length > 1 && (
                    <IconButton
                      onClick={() => removeOption(index)}
                      color="error"
                      size="small"
                    >
                      <FiTrash2 />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Divider />

        {/* Status Ativo */}
        <FormControlLabel
          control={
            <Switch
              checked={formData.active}
              onChange={(e) => handleInputChange("active", e.target.checked)}
            />
          }
          label="Questão Ativa"
        />

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
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Criando..." : "Criar Questão"}
          </Button>
        </Box>
      </Box>
    </ModalTemplate>
  );
}
