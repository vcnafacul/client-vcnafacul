import { Question } from "@/dtos/question/questionDTO";
import { useToastAsync } from "@/hooks/useToastAsync";
import { updateContent } from "@/services/question/updateContent";
import { novaVersaoQuestao } from "@/services/question/novaVersaoQuestao";
import {
  camposQueMudaram,
  type EscolhaDeEdicao,
} from "./escolhaAoSalvar";
import { uploadAsset } from "@/services/question/uploadAsset";
import { useAuthStore } from "@/store/auth";
import { PendingImageStore } from "@/utils/pendingImageStore";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ConteudoFormData, conteudoSchema } from "./schema";

interface UseConteudoFormProps {
  question: Question;
  onSaveSuccess?: () => void;
  pendingStore?: PendingImageStore;
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
  pendingStore,
}: UseConteudoFormProps) {
  const {
    data: { token },
  } = useAuthStore();
  const executeAsync = useToastAsync();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  /*
    ⚠️ **A escolha do card 27.** `null` = nenhum modal aberto. Quando o save
    encontra uma questão JÁ RESPONDIDA, guarda aqui o que mudou e espera a
    decisão — em vez de escrever e perguntar depois.
  */
  const [escolhaPendente, setEscolhaPendente] = useState<{
    campos: string[];
    dados: Record<string, unknown>;
  } | null>(null);

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
  /**
   * Escreve o conteúdo — corrigindo a original ou criando a sucessora.
   *
   * ⚠️ **As duas chamadas recebem o MESMO corpo.** É o que mantém o `27`
   * honesto: a diferença entre corrigir e versionar está no que o servidor faz
   * com as provas, não no que a tela manda.
   */
  const escrever = async (
    dados: Record<string, unknown>,
    escolha: EscolhaDeEdicao,
  ) => {
    setIsSaving(true);
    await executeAsync({
      /*
        ⚠️ O `void` no fim não é adorno: o `executeAsync` tem duas sobrecargas, e
        uma ação que devolve a questão nova escolheria a errada. O que se faz com
        a sucessora é decisão de quem monta (o `onSaveSuccess` recarrega), não
        deste `action`.
      */
      action: async () => {
        if (escolha === "novaVersao") {
          await novaVersaoQuestao(token, question._id, dados);
          return;
        }
        await updateContent(dados as never, token);
      },
      loadingMessage:
        escolha === "novaVersao"
          ? "Criando nova versão..."
          : "Salvando conteúdo...",
      successMessage:
        escolha === "novaVersao"
          ? "Nova versão criada. As provas passaram a usá-la."
          : "Conteúdo salvo com sucesso!",
      errorMessage: "Erro ao salvar conteúdo",
      onSuccess: () => {
        form.reset(dados as never);
        setIsEditing(false);
        setEscolhaPendente(null);
        if (onSaveSuccess) {
          onSaveSuccess();
        }
      },
      onFinally: () => setIsSaving(false),
    });
  };

  const handleSave = async () => {
    if (!isValid) return;

    setIsSaving(true);
    const formData = form.getValues();

    // Deferred upload: upload pending images before saving
    if (pendingStore?.hasPending()) {
      const textFields: (keyof ConteudoFormData)[] = [
        'textoQuestao', 'pergunta', 'textoAlternativaA', 'textoAlternativaB',
        'textoAlternativaC', 'textoAlternativaD', 'textoAlternativaE',
      ];
      const allText = textFields.map(f => (formData[f] as string) || "").join(" ");
      pendingStore.pruneUnused(allText);

      if (pendingStore.hasPending()) {
        const uploadFn = (file: File) => uploadAsset(file, token);
        const replacements = await pendingStore.uploadAll(uploadFn);
        for (const field of textFields) {
          const val = formData[field];
          if (typeof val === "string" && val) {
            (formData as any)[field] = PendingImageStore.replaceInMarkdown(val, replacements);
          }
        }
      }
      pendingStore.cleanup();
    }

    const dados = {
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
      contentFormat: "markdown",
    };

    /*
      ⚠️ **Questão nunca respondida salva DIRETO, sem modal** (card 27). Ali não
      há escolha a fazer: é rascunho, ninguém viu. Perguntar seria cerimônia
      sobre uma decisão que não existe.

      ⚠️ E a contagem vem do contador global, confiável depois dos cards 21 e 22
      — antes deles ele contava apresentações em vez de respostas.
    */
    const respondida = (question.quantidadeResposta ?? 0) > 0;
    const campos = camposQueMudaram(
      question as unknown as Record<string, unknown>,
      dados,
    );

    if (!respondida || campos.length === 0) {
      await escrever(dados, "correcao");
      return;
    }

    setIsSaving(false);
    setEscolhaPendente({ campos, dados });
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

    // A escolha do card 27
    escolhaPendente,
    confirmarEscolha: (escolha: EscolhaDeEdicao) =>
      escolhaPendente && escrever(escolhaPendente.dados, escolha),
    cancelarEscolha: () => setEscolhaPendente(null),
  };
}
