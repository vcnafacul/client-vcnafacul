import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { percentualDeAcerto } from "./percentuais";

/**
 * Quantos acertaram a questão no recorte, e sobre quantos.
 *
 * ⚠️ **`base` anda junto com o percentual, sempre.** Num recorte de três
 * estudantes, "100% acertaram" e "33% acertaram" são números verdadeiros e
 * inúteis — e lidos sem a base, enganosos. Mostrar "de 3" ao lado deixa quem
 * lê julgar a amostra, sem que a tela precise esconder nada por baixo de um
 * limiar inventado.
 */
export interface DificuldadeDaQuestao {
  percentual: number;
  base: number;
}

/**
 * Índice por `questaoId` para o detalhe do estudante cruzar com o agregado.
 *
 * ⚠️ Os dois lados vêm do mesmo recorte (`simuladoId` + `turmaId`), então o
 * percentual é o da turma aberta — e não o do simulado inteiro. É o que
 * responde "foi difícil para a MINHA turma", que é a pergunta de quem
 * coordena. O rótulo da coluna diz isso, para ninguém ler como estatística
 * geral da prova.
 *
 * ⚠️ Questão sem respondentes fica **fora do mapa**, em vez de entrar com
 * zero: `percentualDeAcerto` devolve `null` ali, e um `0` inventado seria lido
 * como "ninguém acertou".
 */
export function indiceDeDificuldade(
  questoes: QuestaoDoRelatorio[],
): Map<string, DificuldadeDaQuestao> {
  const mapa = new Map<string, DificuldadeDaQuestao>();

  for (const q of questoes) {
    const pct = percentualDeAcerto(q);
    if (pct === null) continue;
    mapa.set(q.questaoId, { percentual: pct, base: q.respondentes });
  }

  return mapa;
}

/** `"60% de 20"`, ou travessão quando a questão não está no índice. */
export function formatarDificuldade(d?: DificuldadeDaQuestao): string {
  return d === undefined ? "—" : `${d.percentual}% de ${d.base}`;
}
