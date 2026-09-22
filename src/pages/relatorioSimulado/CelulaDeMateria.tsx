import { dashV2 } from "@/components/dashV2";
import type {
  LinhaDoRelatorio,
  MediaPorMateria,
} from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
import { abaixoDaTurma, notaNaMateria } from "./materiasDoRelatorio";

export const VAZIO_DA_MATERIA = "—";

/**
 * A célula de uma matéria.
 *
 * ⚠️ **Três estados, e os três são diferentes:**
 *
 * 1. sem leitura concluída → vazio, pelo mesmo `leituraVale` de sempre;
 * 2. o aluno não TEM esta matéria → `—`, nunca `0%`. Ele pode não ter Química
 *    porque nenhuma questão de Química foi lida no cartão dele, e zero
 *    afirmaria que ele errou todas;
 * 3. tem nota → o percentual, com marcador quando está significativamente
 *    abaixo da turma.
 *
 * ⚠️ **O marcador é TEXTO (`↓`), não só cor.** Mesma medição do `tokens.ts` de
 * sempre: nenhuma cor de acento desta paleta carrega significado sozinha sobre
 * branco, e "este aluno está muito abaixo da turma nesta matéria" é justamente
 * o que a pessoa varre a coluna procurando.
 */
export function CelulaDeMateria({
  linha,
  materia,
  desvio,
}: {
  linha: LinhaDoRelatorio;
  materia: MediaPorMateria;
  desvio: number | undefined;
}) {
  /*
    ⚠️ **O mesmo gate de `leituraVale` da coluna de aproveitamento**, e repetido
    aqui de propósito em vez de importado: `marcarFalha` no ms não limpa
    `aproveitamento`, e as matérias vão pelo mesmo caminho — uma linha `failed`
    chega com as notas da leitura ANTERIOR.
  */
  if (linha.status !== "completed") return <></>;

  const nota = notaNaMateria(linha, materia.id);
  if (nota === undefined) {
    return <span className={dashV2.text.muted}>{VAZIO_DA_MATERIA}</span>;
  }

  const alerta = abaixoDaTurma(nota, materia.media, desvio);
  const texto = `${Math.round(nota * 100)}%`;

  if (!alerta) return <>{texto}</>;

  return (
    <span
      data-abaixo-da-turma
      title={`Abaixo da média da turma em ${materia.nome} (${Math.round(
        materia.media * 100,
      )}%)`}
      className={cn("font-semibold", dashV2.text.primary)}
    >
      {texto} ↓
    </span>
  );
}

