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
  evasao: {
    oQueE: "a parte dos alunos que deixou o cursinho depois de começar a frequentar.",
    comoContamos:
      "cancelamentos divididos pelos alunos do período. Quem desistiu antes de começar (desistência inicial) não entra na conta, nem em cima nem embaixo, e aparece separado.",
    ficaDeFora:
      "matrículas encerradas no fim do período, que são alunos que concluíram.",
  },
  turmaComMaiorEvasao: {
    oQueE: "a evasão de cada turma, para ver onde ela se concentra.",
    comoContamos:
      "a mesma conta da evasão do cursinho, feita só com os alunos de cada turma. O aluno conta na turma em que está matriculado hoje.",
    ficaDeFora:
      "do destaque, as turmas com menos de 10 alunos, porque nelas um único cancelamento muda muito a porcentagem.",
  },
  frequencia: {
    oQueE: "de cada 100 presenças possíveis, quantas aconteceram.",
    comoContamos:
      "somamos as presenças de todos os alunos e dividimos pelo total de chamadas em que eles estavam na turma. Quem entrou no meio do período só conta a partir da matrícula.",
    ficaDeFora:
      "turmas que ainda não registraram chamada. Falta justificada conta como falta, mas mostramos quantas foram.",
  },
  sumindo: {
    oQueE:
      "alunos com a matrícula em vigor que faltaram às 3 últimas aulas seguidas da turma. É um aviso para procurar o aluno antes que ele desista.",
    comoContamos:
      "olhamos as 3 chamadas mais recentes de cada turma. Se o aluno faltou em todas, ele aparece aqui.",
    ficaDeFora:
      "faltas justificadas e alunos de turmas com menos de 3 chamadas registradas.",
  },
} satisfies Record<string, ExplicacaoDaMetrica>;
