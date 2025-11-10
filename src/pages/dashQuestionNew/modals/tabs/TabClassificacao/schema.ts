import * as yup from "yup";

/**
 * Schema de validação para a Tab de Classificação
 * Valida apenas os campos relacionados à classificação da questão
 */
export const classificacaoSchema = yup.object({
  // Campos obrigatórios
  prova: yup
    .string()
    .required("A prova é obrigatória")
    .min(1, "Selecione uma prova"),

  numero: yup
    .number()
    .required("O número da questão é obrigatório")
    .positive("O número deve ser positivo")
    .integer("O número deve ser um inteiro")
    .min(1, "O número deve ser maior que 0"),

  enemArea: yup
    .string()
    .required("A área do conhecimento ENEM é obrigatória")
    .min(1, "Selecione uma área do conhecimento"),

  materia: yup
    .string()
    .required("A disciplina é obrigatória")
    .min(1, "Selecione uma disciplina"),

  frente1: yup
    .string()
    .required("A frente principal é obrigatória")
    .min(1, "Selecione a frente principal"),

  // Campos opcionais
  frente2: yup.string().optional().nullable(),

  frente3: yup.string().optional().nullable(),

  // Flags de revisão
  provaClassification: yup.boolean().default(false),

  subjectClassification: yup.boolean().default(false),

  reported: yup.boolean().default(false),
});

/**
 * Tipo inferido do schema
 */
export type ClassificacaoFormData = yup.InferType<typeof classificacaoSchema>;

/**
 * Valores padrão para o formulário
 */
export const classificacaoDefaultValues: Partial<ClassificacaoFormData> = {
  prova: "",
  numero: 1,
  enemArea: "",
  materia: "",
  frente1: "",
  frente2: "",
  frente3: "",
  provaClassification: false,
  subjectClassification: false,
  reported: false,
};
