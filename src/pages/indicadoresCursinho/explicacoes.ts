import type { ExplicacaoDaMetrica } from "@/components/indicadores/InfoDaMetrica";

/**
 * O texto do (i) de cada métrica — o mesmo na tela de Indicadores e na
 * dashboard. Quem lê é o cursinho: nada de nome de campo ou status do sistema
 * (tickets/033, R2). O texto de cada uma vem do card dela.
 */
export const explicacoes = {
  alunos: {
    oQueE: "quantos alunos tiveram a matrícula confirmada neste período letivo.",
    comoContamos:
      "todo aluno que chegou a ser matriculado em uma das turmas do período, inclusive quem depois cancelou ou concluiu.",
    ficaDeFora:
      "quem se inscreveu mas não foi selecionado, quem não confirmou a matrícula e quem está na lista de espera.",
  },
  ativos: {
    oQueE: "quantos alunos estão com a matrícula em vigor hoje.",
    comoContamos:
      "alunos matriculados nas turmas deste período que não tiveram a matrícula cancelada. Em um período já encerrado, mostramos quantos chegaram até o último dia.",
    ficaDeFora:
      "matrículas canceladas, mesmo que o aluno ainda apareça em alguma lista antiga.",
  },
  cancelados: {
    oQueE: "quantos alunos deste período tiveram a matrícula cancelada.",
    comoContamos:
      "cada aluno conta uma vez, com o motivo escolhido no cancelamento. Se a matrícula foi reativada depois, ele deixa de contar.",
    ficaDeFora:
      "quem concluiu o período; matrícula encerrada no fim do período não é cancelamento.",
  },
} satisfies Record<string, ExplicacaoDaMetrica>;
