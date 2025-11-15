import { Button } from "@/components/ui/button";
import { CreateQuestion } from "@/dtos/question/updateQuestion";
import { useToastAsync } from "@/hooks/useToastAsync";
import { createQuestion } from "@/services/question/createQuestion";
import { useAuthStore } from "@/store/auth";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import ModalTabTemplateQuestion from "../components/ModalTabTemplateQuestion";
import { TabClassificacaoCreate } from "./tabs/TabClassificacaoCreate";
import { TabConteudoCreate } from "./tabs/TabConteudoCreate";

interface ModalCreateQuestionProps {
  isOpen: boolean;
  onClose: () => void;
  infos: any;
  onSuccess?: () => void;
}

export function ModalCreateQuestion({
  isOpen,
  onClose,
  infos,
  onSuccess,
}: ModalCreateQuestionProps) {
  const {
    data: { token },
  } = useAuthStore();
  const executeAsync = useToastAsync();

  const [isSaving, setIsSaving] = useState(false);

  // Estado do formulário
  const [formData, setFormData] = useState<Partial<CreateQuestion>>({
    prova: "",
    enemArea: "",
    frente1: "",
    frente2: null,
    frente3: null,
    materia: "",
    numero: 1,
    textoQuestao: "",
    pergunta: "",
    textoAlternativaA: "",
    textoAlternativaB: "",
    textoAlternativaC: "",
    textoAlternativaD: "",
    textoAlternativaE: "",
    alternativa: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: keyof CreateQuestion, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando for alterado
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações de Classificação
    if (!formData.prova) newErrors.prova = "Prova é obrigatória";
    if (!formData.enemArea) newErrors.enemArea = "Área ENEM é obrigatória";
    if (!formData.materia) newErrors.materia = "Matéria é obrigatória";
    if (!formData.frente1) newErrors.frente1 = "Frente principal é obrigatória";
    if (!formData.numero || formData.numero < 1)
      newErrors.numero = "Número deve ser maior que 0";

    // Validações de Conteúdo
    if (!formData.textoQuestao?.trim())
      newErrors.textoQuestao = "Texto da questão é obrigatório";
    if (!formData.textoAlternativaA?.trim())
      newErrors.textoAlternativaA = "Alternativa A é obrigatória";
    if (!formData.textoAlternativaB?.trim())
      newErrors.textoAlternativaB = "Alternativa B é obrigatória";
    if (!formData.textoAlternativaC?.trim())
      newErrors.textoAlternativaC = "Alternativa C é obrigatória";
    if (!formData.textoAlternativaD?.trim())
      newErrors.textoAlternativaD = "Alternativa D é obrigatória";
    if (!formData.textoAlternativaE?.trim())
      newErrors.textoAlternativaE = "Alternativa E é obrigatória";
    if (!formData.alternativa)
      newErrors.alternativa = "Resposta correta é obrigatória";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      // Se há erros na aba atual, não mudar de aba
      return;
    }

    setIsSaving(true);
    await executeAsync({
      action: () => createQuestion(formData as CreateQuestion, token),
      loadingMessage: "Criando questão...",
      successMessage: "✅ Questão criada com sucesso!",
      errorMessage: "Erro ao criar questão",
      onSuccess: () => {
        // Reset form
        setFormData({
          prova: "",
          enemArea: "",
          frente1: "",
          frente2: null,
          frente3: null,
          materia: "",
          numero: 1,
          textoQuestao: "",
          pergunta: "",
          textoAlternativaA: "",
          textoAlternativaB: "",
          textoAlternativaC: "",
          textoAlternativaD: "",
          textoAlternativaE: "",
          alternativa: "",
        });
        setErrors({});
        onClose();
        if (onSuccess) onSuccess();
      },
      onFinally: () => setIsSaving(false),
    });
  };

  const handleClose = () => {
    if (
      !isSaving &&
      (Object.keys(formData).some((key) => {
        const value = formData[key as keyof CreateQuestion];
        return value && value !== "" && value !== 1;
      }) ||
        Object.keys(errors).length > 0)
    ) {
      if (
        confirm(
          "Você tem alterações não salvas. Deseja realmente fechar o modal?"
        )
      ) {
        setFormData({
          prova: "",
          enemArea: "",
          frente1: "",
          frente2: null,
          frente3: null,
          materia: "",
          numero: 1,
          textoQuestao: "",
          pergunta: "",
          textoAlternativaA: "",
          textoAlternativaB: "",
          textoAlternativaC: "",
          textoAlternativaD: "",
          textoAlternativaE: "",
          alternativa: "",
        });
        setErrors({});
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <ModalTabTemplateQuestion
      isOpen={isOpen}
      className="px-4 py-2"
      tabs={[
        {
          label: "Classificação",
          id: "classificacao",
          children: (
            <TabClassificacaoCreate
              formData={formData}
              errors={errors}
              infos={infos}
              onChange={updateFormData}
            />
          ),
          handleClose: handleClose,
        },
        {
          label: "Conteúdo",
          id: "conteudo",
          children: (
            <TabConteudoCreate
              formData={formData}
              errors={errors}
              onChange={updateFormData}
            />
          ),
          handleClose: handleClose,
        },
      ]}
      footerContent={
        <div className="flex justify-end gap-3 p-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Criar Questão
              </>
            )}
          </Button>
        </div>
      }
    />
  );
}
