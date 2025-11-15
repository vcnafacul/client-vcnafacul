import { Question } from "@/dtos/question/questionDTO";
import { useToastAsync } from "@/hooks/useToastAsync";
import { updateClassification } from "@/services/question/updateClassification";
import { useAuthStore } from "@/store/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ClassificacaoFormData, classificacaoSchema } from "./schema";

interface UseClassificacaoFormProps {
  question: Question;
  onSaveSuccess?: () => void;
}

/**
 * Hook personalizado para gerenciar o formulário de classificação
 *
 * Responsabilidades:
 * - Gerenciar estado do formulário (React Hook Form)
 * - Controlar modo edição/visualização
 * - Validar dados (Yup)
 * - Salvar alterações via API
 * - Feedback de loading e erros
 */
export function useClassificacaoForm({
  question,
  onSaveSuccess,
}: UseClassificacaoFormProps) {
  const {
    data: { token },
  } = useAuthStore();
  const executeAsync = useToastAsync();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Formulário local da tab com validação Yup
  const form = useForm<ClassificacaoFormData>({
    resolver: yupResolver(classificacaoSchema),
    defaultValues: {
      prova: question.prova || "",
      numero: question.numero || 1,
      enemArea: question.enemArea || "",
      materia: question.materia || "",
      frente1: question.frente1 || "",
      frente2: question.frente2 || "",
      frente3: question.frente3 || "",
      provaClassification: question.provaClassification || false,
      subjectClassification: question.subjectClassification || false,
      reported: question.reported || false,
    },
    mode: "onChange", // Valida em tempo real
  });

  const isDirty = form.formState.isDirty;
  const isValid = form.formState.isValid;
  const errors = form.formState.errors;

  // Resetar formulário quando a questão mudar (ex: trocar de questão)
  useEffect(() => {
    if (question) {
      form.reset({
        prova: question.prova || "",
        numero: question.numero || 1,
        enemArea: question.enemArea || "",
        materia: question.materia || "",
        frente1: question.frente1 || "",
        frente2: question.frente2 || "",
        frente3: question.frente3 || "",
        provaClassification: question.provaClassification || false,
        subjectClassification: question.subjectClassification || false,
        reported: question.reported || false,
      });
      setIsEditing(false);
    }
  }, [question._id]); // Reage apenas quando o ID muda

  /**
   * Ativar modo edição
   */
  const handleEdit = () => {
    setIsEditing(true);
  };

  /**
   * Salvar alterações da classificação
   * Envia apenas os dados desta tab para a API
   */
  const handleSave = async () => {
    if (!isValid) {
      return;
    }

    setIsSaving(true);

    const formData = form.getValues();

    try {
      await executeAsync({
        action: () =>
          updateClassification(
            {
              _id: question._id,
              prova: formData.prova,
              numero: formData.numero,
              enemArea: formData.enemArea,
              materia: formData.materia,
              frente1: formData.frente1,
              frente2: formData.frente2 || undefined,
              frente3: formData.frente3 || undefined,
              provaClassification: formData.provaClassification,
              subjectClassification: formData.subjectClassification,
              reported: formData.reported,
            },
            token
          ),
        loadingMessage: "Salvando classificação...",
        successMessage: "✅ Classificação salva com sucesso!",
        errorMessage: "Erro ao salvar classificação",
        onFinally: () => setIsSaving(false),
      });

      // Atualizar baseline do formulário após salvar
      form.reset(formData);
      setIsEditing(false);

      // Callback opcional para recarregar dados
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      console.error("Erro ao salvar classificação:", error);
    }
  };

  /**
   * Cancelar edição
   * Volta aos valores originais
   */
  const handleCancel = () => {
    form.reset(); // Reseta para os valores do defaultValues
    setIsEditing(false);
  };

  return {
    // Formulário completo
    form,

    // Métodos individuais (para compatibilidade)
    register: form.register,
    control: form.control,
    watch: form.watch,
    setValue: form.setValue,

    // Estado
    isEditing,
    isSaving,
    isDirty,
    isValid,
    errors,

    // Ações
    handleEdit,
    handleSave,
    handleCancel,
  };
}
