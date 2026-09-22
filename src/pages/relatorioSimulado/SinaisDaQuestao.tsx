import { StatusBadge, dashV2 } from "@/components/dashV2";
import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
import { DicaRapida } from "./DicaRapida";
import {
  APRESENTACAO_DAS_FLAGS,
  explicacaoDaFlag,
  flagsDaQuestao,
} from "./flagsDaQuestao";

export const SEM_SINAL = "—";

/**
 * Os badges de triagem de uma questão.
 *
 * ⚠️ **Acumulam, e não se elege um principal**: "muito difícil" **e** "gabarito
 * suspeito" juntos é o que fecha o diagnóstico — difícil sozinha pede aula,
 * difícil com gabarito suspeito pede conferir o gabarito antes de tudo.
 *
 * ⚠️ **Rótulo textual sempre**, cor só como reforço — ver
 * `APRESENTACAO_DAS_FLAGS`. A explicação inteira vai no `title`.
 *
 * ⚠️ **O valor da discriminação vai no `title` do badge**, e não em coluna
 * própria: foi a decisão do card 19. O coordenador não quer saber que o
 * ponto-bisserial é −0,34; quer saber que a questão presta ou não. Mas quem
 * quiser conferir tem o número ao alcance do cursor — e no CSV.
 */
export function SinaisDaQuestao({
  questao,
  medianaSemLeitura = null,
}: {
  questao: QuestaoDoRelatorio;
  /**
   * ⚠️ Só para a `leitura_suspeita` (card 12), que é a única flag que depende
   * do conjunto. `null` = não avaliado, e a coluna volta ao que era.
   */
  medianaSemLeitura?: number | null;
}) {
  const flags = flagsDaQuestao(questao, medianaSemLeitura);

  if (flags.length === 0) {
    // ⚠️ Travessão, e não célula vazia: vazio se lê como "não calculou".
    return <span className={dashV2.text.muted}>{SEM_SINAL}</span>;
  }

  return (
    <span className="flex flex-wrap gap-1 py-1">
      {flags.map((flag) => {
        const { rotulo, tone } = APRESENTACAO_DAS_FLAGS[flag];
        /*
          ⚠️ **A explicação traz os números DESTA questão**, não o limiar
          genérico. Quem passa o mouse está olhando uma linha específica e quer
          saber o que ELA tem: "só 22% acertaram" responde, "menos de 25%" manda
          conferir na coluna ao lado.

          E no distrator ela NOMEIA a alternativa morta — a informação já estava
          calculada, só não estava sendo dita.
        */
        return (
          <DicaRapida
            key={flag}
            marcador={flag}
            texto={explicacaoDaFlag(flag, questao)}
          >
            <StatusBadge tone={tone} label={rotulo} className={cn("text-xs")} />
          </DicaRapida>
        );
      })}
    </span>
  );
}
