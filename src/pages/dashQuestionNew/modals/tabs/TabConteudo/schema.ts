import * as yup from "yup";

/**
 * Schema de validação para a Tab de Conteúdo
 * Valida apenas os campos relacionados ao conteúdo da questão
 */
export const conteudoSchema = yup.object({
  // Texto da questão
  textoQuestao: yup
    .string()
    .required("O texto da questão é obrigatório")
    .min(10, "O texto da questão deve ter pelo menos 10 caracteres")
    .max(5000, "O texto da questão não pode ter mais de 5000 caracteres"),

  // Pergunta (opcional)
  pergunta: yup
    .string()
    .optional()
    .max(500, "A pergunta não pode ter mais de 500 caracteres"),

  // Alternativas - todas obrigatórias
  textoAlternativaA: yup
    .string()
    .required("A alternativa A é obrigatória")
    .min(1, "A alternativa A não pode estar vazia")
    .max(1000, "A alternativa A não pode ter mais de 1000 caracteres"),

  textoAlternativaB: yup
    .string()
    .required("A alternativa B é obrigatória")
    .min(1, "A alternativa B não pode estar vazia")
    .max(1000, "A alternativa B não pode ter mais de 1000 caracteres"),

  textoAlternativaC: yup
    .string()
    .required("A alternativa C é obrigatória")
    .min(1, "A alternativa C não pode estar vazia")
    .max(1000, "A alternativa C não pode ter mais de 1000 caracteres"),

  textoAlternativaD: yup
    .string()
    .required("A alternativa D é obrigatória")
    .min(1, "A alternativa D não pode estar vazia")
    .max(1000, "A alternativa D não pode ter mais de 1000 caracteres"),

  textoAlternativaE: yup
    .string()
    .required("A alternativa E é obrigatória")
    .min(1, "A alternativa E não pode estar vazia")
    .max(1000, "A alternativa E não pode ter mais de 1000 caracteres"),

  // Resposta correta
  alternativa: yup
    .string()
    .required("A alternativa correta é obrigatória")
    .oneOf(
      ["A", "B", "C", "D", "E"],
      "Selecione uma alternativa válida (A, B, C, D ou E)"
    ),

  // Flags de revisão
  textClassification: yup.boolean().default(false),

  alternativeClassfication: yup.boolean().default(false),
});

/**
 * Tipo inferido do schema
 */
export type ConteudoFormData = yup.InferType<typeof conteudoSchema>;

/**
 * Valores padrão para o formulário
 */
export const conteudoDefaultValues: Partial<ConteudoFormData> = {
  textoQuestao: "",
  pergunta: "",
  textoAlternativaA: "",
  textoAlternativaB: "",
  textoAlternativaC: "",
  textoAlternativaD: "",
  textoAlternativaE: "",
  alternativa: "",
  textClassification: false,
  alternativeClassfication: false,
};

/**
 * Validação customizada: pelo menos uma alternativa deve ser diferente das outras
 * (previne que todas as alternativas sejam iguais)
 */
export const validateAlternativasUnicas = (data: ConteudoFormData): boolean => {
  const alternativas = new Set([
    data.textoAlternativaA?.trim(),
    data.textoAlternativaB?.trim(),
    data.textoAlternativaC?.trim(),
    data.textoAlternativaD?.trim(),
    data.textoAlternativaE?.trim(),
  ]);

  // Se o Set tem menos de 5 elementos, significa que há duplicatas
  return alternativas.size === 5;
};
