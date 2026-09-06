/**
 * Justificativas pre-definidas para o cancelamento de matricula.
 *
 * A ordem foi definida pelo time e vai do motivo mais comum ao menos
 * especifico — nao reordenar (nem alfabeticamente).
 *
 * Os `label` sao gravados no historico do estudante (`LogStudent.description`)
 * exatamente como escritos aqui. Mudar a redacao depois cria uma segunda
 * grafia no banco, e os registros antigos nao sao reescritos — o que
 * atrapalharia um futuro relatorio de motivos de evasao.
 */
export const ENROLLMENT_CANCELLATION_REASONS = [
  {
    label: "Rotina",
    note: "Conflitos de horários, sobrecarga, trabalho e responsabilidades domésticas.",
  },
  {
    label: "Transporte",
    note: "Dificuldades de locomoção.",
  },
  {
    label: "Motivos pessoais",
    note: "Questões de saúde, financeiras, familiares ou particulares.",
  },
  {
    label: "Desistência inicial",
    note: "Não comparecimento desde o início das aulas.",
  },
  {
    label: "Abandono",
    note: "Interrupção definitiva da frequência após período de participação.",
  },
  {
    label: "Não informou o motivo",
    note: undefined,
  },
  {
    // Sem nota: a propria opcao ja diz o que e, e a caixa de texto que ela
    // abre deixa claro o que se espera.
    label: "Outros (especifique)",
    note: undefined,
  },
] as const;

/** Opcao que libera a caixa de texto livre. */
export const OTHER_CANCELLATION_REASON_LABEL = "Outros (especifique)";

/**
 * Prefixo aplicado ao texto livre. Mantem explicito no historico que o caso
 * ficou fora das categorias fixas, o que permite agrupa-los depois.
 */
export const OTHER_CANCELLATION_REASON_PREFIX = "Outros: ";
