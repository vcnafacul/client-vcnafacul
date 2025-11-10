import { Question } from "@/dtos/question/questionDTO";
import { useToastAsync } from "@/hooks/useToastAsync";
import { updateContent } from "@/services/question/updateContent";
import { useAuthStore } from "@/store/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ConteudoFormData, conteudoSchema } from "./schema";

interface UseConteudoFormProps {
  question: Question;
  onSaveSuccess?: () => void;
}

/**
 * Hook personalizado para gerenciar o formulário de conteúdo
 *
 * Responsabilidades:
 * - Gerenciar estado do formulário (React Hook Form)
 * - Controlar modo edição/visualização
 * - Validar dados (Yup)
 * - Salvar alterações via API
 * - Feedback de loading e erros
 */
export function useConteudoForm({
  question,
  onSaveSuccess,
}: UseConteudoFormProps) {
  const {
    data: { token },
  } = useAuthStore();
  const executeAsync = useToastAsync();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Formulário local da tab com validação Yup
  const form = useForm<ConteudoFormData>({
    resolver: yupResolver(conteudoSchema),
    defaultValues: {
      textoQuestao: question.textoQuestao || "",
      pergunta: question.pergunta || "",
      textoAlternativaA: question.textoAlternativaA || "",
      textoAlternativaB: question.textoAlternativaB || "",
      textoAlternativaC: question.textoAlternativaC || "",
      textoAlternativaD: question.textoAlternativaD || "",
      textoAlternativaE: question.textoAlternativaE || "",
      alternativa: question.alternativa || "",
      textClassification: question.textClassification || false,
      alternativeClassfication: question.alternativeClassfication || false,
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
        textoQuestao: question.textoQuestao || "",
        pergunta: question.pergunta || "",
        textoAlternativaA: question.textoAlternativaA || "",
        textoAlternativaB: question.textoAlternativaB || "",
        textoAlternativaC: question.textoAlternativaC || "",
        textoAlternativaD: question.textoAlternativaD || "",
        textoAlternativaE: question.textoAlternativaE || "",
        alternativa: question.alternativa || "",
        textClassification: question.textClassification || false,
        alternativeClassfication: question.alternativeClassfication || false,
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
   * Salvar alterações do conteúdo
   * Envia apenas os dados desta tab para a API
   */
  const handleSave = async () => {
    if (!isValid) return;

    setIsSaving(true);
    const formData = form.getValues();
    await executeAsync({
      action: () =>
        updateContent(
          {
            _id: question._id,
            textoQuestao: formData.textoQuestao,
            pergunta: formData.pergunta,
            textoAlternativaA: formData.textoAlternativaA,
            textoAlternativaB: formData.textoAlternativaB,
            textoAlternativaC: formData.textoAlternativaC,
            textoAlternativaD: formData.textoAlternativaD,
            textoAlternativaE: formData.textoAlternativaE,
            alternativa: formData.alternativa,
            textClassification: formData.textClassification,
            alternativeClassfication: formData.alternativeClassfication,
          },
          token
        ),
      loadingMessage: "Salvando conteúdo...",
      successMessage: "✅ Conteúdo salvo com sucesso!",
      errorMessage: "Erro ao salvar conteúdo",
      onSuccess: () => {
        form.reset(formData);
        setIsEditing(false);
        if (onSaveSuccess) {
          onSaveSuccess();
        }
      },
      onFinally: () => setIsSaving(false),
    });
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
    // Formulário
    form,
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
