import { dashV2, StatusBadge, type DashColumn } from "@/components/dashV2";
import type {
  LinhaDoRelatorio,
  MediaPorMateria,
} from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
import {
  LARGURA_DA_COLUNA_DE_MATERIA,
  notaNaMateria,
} from "./materiasDoRelatorio";
import { CelulaDeMateria } from "./CelulaDeMateria";
import { statusDaLinha } from "./statusDaLinha";

export const VAZIO = "—";

/**
 * ⚠️ **A leitura só vale quando concluiu.** O `marcarFalha` do ms
 * (`historico.repository.ts`) grava **só** `status` e `falha`: não limpa
 * `aproveitamento`, nem `questoesRespondidas`, nem `respostas`. Os dois
 * números são escritos ANTES de a falha acontecer — `questoesRespondidas` no
 * `createPending`, `aproveitamento` no `completeProcessing` — e continuam no
 * documento depois que ele vira `failed`. A api repassa como vieram, de
 * propósito: ela não reescreve o que o ms disse.
 *
 * Renderizar qualquer um deles mostraria "Falhou" ao lado de um número que
 * afirma uma leitura que não existe — e a aba de questões, que filtra por
 * status no ms, já não conta esse cartão.
 *
 * ⚠️ **`falha` é o terceiro campo obsoleto, e vaza na direção contrária.** O
 * `marcarFalha` é o ÚNICO escritor de `falha` e **nada a desfaz** — o `$unset`
 * é de um card futuro que não existe, como diz o próprio docblock dele. Então
 * um cartão que falhou, foi refotografado e leu bem passa pelo
 * `completeProcessing` (que grava `status: completed`, `aproveitamento`,
 * `respostas` e **não toca em `falha`**) e chega aqui `completed` carregando o
 * motivo velho. Sem gate, a linha diria "Lido", "80%" e "não foi possível
 * localizar o cartão na foto" ao mesmo tempo. O mesmo vale no meio do caminho:
 * o `prepararParaProcessamento` grava `rawRespostas` + `status: pending` e
 * também deixa a `falha` no documento.
 */
function leituraVale(linha: LinhaDoRelatorio): boolean {
  return linha.status === "completed";
}

/**
 * A nota só existe para leitura concluída — ver `leituraVale`.
 *
 * ⚠️ E ausência vira vazio, **nunca zero**: zero é uma nota, ausência de
 * leitura não é.
 */
function textoDoAproveitamento(linha: LinhaDoRelatorio): string {
  if (!leituraVale(linha)) return VAZIO;
  if (typeof linha.aproveitamentoGeral !== "number") return VAZIO;
  return `${Math.round(linha.aproveitamentoGeral * 100)}%`;
}

export function colunasDoRelatorio({
  comTurma,
  materias = [],
  desvios = new Map(),
}: {
  /** `true` quando o recorte já é de uma turma — aí a coluna Turma some. */
  comTurma: boolean;
  /**
   * As matérias que viram coluna — já passadas por `materiasVisiveis`.
   *
   * ⚠️ **Vêm do RESUMO, nunca da varredura das linhas.** Derivadas das linhas,
   * as colunas apareceriam e sumiriam conforme o filtro de busca, e ver uma
   * coluna desaparecer ao digitar um nome faz a pessoa desconfiar da tela toda.
   *
   * ⚠️ Padrão `[]`: sem o card 02 no ar (ou em recorte sem matéria nenhuma) a
   * tabela fica exatamente como era.
   */
  materias?: MediaPorMateria[];
  /** Desvio-padrão da turma por matéria — ver `desviosPorMateria`. */
  desvios?: Map<string, number>;
}): DashColumn<LinhaDoRelatorio>[] {
  const colunas: DashColumn<LinhaDoRelatorio>[] = [
    {
      id: "estudante",
      header: "Estudante",
      primary: true,
      cell: (l) => (
        <>
          <span className={cn("block font-medium", dashV2.text.primary)}>
            {l.nome}
          </span>
          <span className={cn("block text-xs", dashV2.text.muted)}>
            {l.matricula}
          </span>
        </>
      ),
      // `sortRows` já resolve localeCompare pt-BR — devolver a string crua basta
      sortValue: (l) => l.nome,
    },
  ];

  // ⚠️ Coluna constante só ocupa largura que os nomes precisam.
  if (!comTurma) {
    colunas.push({
      id: "turma",
      header: "Turma",
      width: "10rem",
      hideBelow: "sm",
      cell: (l) => l.turmaNome ?? VAZIO,
      sortValue: (l) => l.turmaNome,
    });
  }

  colunas.push(
    {
      id: "situacao",
      header: "Situação",
      width: "18rem",
      /*
        ⚠️ **`Status`, `Cartão` e `Motivo` colapsaram aqui** (card 19).

        Quatro das seis colunas eram sobre o CARTÃO, não sobre o aluno. Era o
        certo quando a tela nasceu para conferir leitura; deixa de ser quando a
        leitura funciona e a pergunta vira "como foram". As duas colunas
        liberadas pagam as colunas de matéria do card 07 — que não conseguia
        caber sozinho.

        Empilhado, no mesmo padrão de duas linhas que a coluna `Estudante` já
        usa para nome + matrícula.

        ⚠️ **O ganho de largura é a coluna FLEXÍVEL, não a fixa** — e vale
        dizer com precisão, porque a soma das larguras declaradas **não mudou**:
        eram `turma` 10rem + `status` 11rem + `aproveitamento` 9rem + `cartao`
        7rem = 592px, e são `turma` 10rem + `situacao` 18rem + `aproveitamento`
        9rem = os mesmos 592px (a `situacao` absorveu exatamente `status` +
        `cartao`).

        O que mudou é que `motivo` não tinha `width`: ele competia com
        `estudante` pelo espaço restante, e precisava ser largo para não
        truncar — e truncava assim mesmo, em ~245px. Com ele fora sobra uma
        coluna flexível só, e o resto do espaço fica disponível para as colunas
        de matéria do card 07, que não conseguia caber sozinho.
      */
      cell: (l) => {
        const { tone, label } = statusDaLinha(l);
        const motivo = l.status === "failed" ? l.falha?.descricao : undefined;

        return (
          <span className="block py-1">
            <StatusBadge tone={tone} label={label} />
            {/*
              ⚠️ **Fora do gate de `leituraVale`, de propósito.** `cartaoCode`
              é escrito do QR da folha no `createAwaitingOmr`: é a IDENTIDADE
              do cartão físico, não um RESULTADO da leitura. Numa linha que
              falhou é a coisa mais útil que existe — diz qual folha
              refotografar.
            */}
            {l.cartaoCode !== undefined && (
              <span
                data-cartao
                className={cn("mt-0.5 block text-xs", dashV2.text.muted)}
              >
                {l.cartaoCode}
              </span>
            )}
            {/*
              ⚠️ **`whitespace-normal` é o que faz o motivo não truncar**, e é o
              ponto inteiro desta coluna. O `DashTable` embrulha toda célula
              num `span.block.truncate`, e `truncate` inclui
              `white-space: nowrap` — sem sobrepor no filho, o motivo ficaria
              numa linha só e cortado em ~245px, que é o defeito que a coluna
              `Motivo` existia para evitar e que este card tinha de preservar.

              ⚠️ **Gateado em `failed`**: nada desfaz a `falha` no ms (ver
              `leituraVale`), então um cartão que falhou, foi refotografado e
              leu bem chega `completed` carregando o motivo velho. Sem isto a
              célula diria "Lido" e "não foi possível localizar o cartão" ao
              mesmo tempo.

              ⚠️ A linha cresce SÓ aqui — e são poucas linhas, justamente as
              que merecem ocupar mais espaço.
            */}
            {motivo !== undefined && (
              <span
                data-motivo
                className={cn(
                  "mt-0.5 block whitespace-normal text-xs",
                  dashV2.text.secondary,
                )}
              >
                {motivo}
              </span>
            )}
          </span>
        );
      },
      /*
        ⚠️ Pelo `ordem`, e **nunca** pelo texto concatenado da célula:
        alfabético daria "Aguardando" < "Falhou" < "Lido" < "Não enviou", que
        não é ordem de trabalho nenhuma. Isto não mudou no card 19 — mas é
        fácil quebrar sem querer ao mexer na célula.
      */
      sortValue: (l) => statusDaLinha(l).ordem,
    },
    {
      id: "aproveitamento",
      header: "Aproveitamento",
      width: "9rem",
      align: "right",
      cell: (l) => textoDoAproveitamento(l),
      // ⚠️ Ordena pelo número, não pelo texto: "9%" antes de "80%" senão.
      // E só quem tem leitura entra — os demais vão para o fim, como nulos.
      sortValue: (l) =>
        leituraVale(l) && typeof l.aproveitamentoGeral === "number"
          ? l.aproveitamentoGeral
          : null,
    },
  );

  /*
    ⚠️ **Por MATÉRIA, não por frente.** Um simulado do ENEM tem ~4 matérias e
    pode ter 15+ frentes; frentes virariam 15 colunas numa tabela que já
    estourou a largura na outra aba. A frente é drill-down e mora no modal
    (card 10).

    ⚠️ O conjunto é DINÂMICO — sai do que o recorte tem, não de uma lista fixa.
    Um simulado só de Matemática desenha uma coluna.

    ⚠️ Estas colunas só cabem por causa do card 19, que colapsou `Status` +
    `Cartão` + `Motivo` em `Situação`. Ver `materiasDoRelatorio.ts` para a
    medição que fixa o teto em 4.
  */
  for (const materia of materias) {
    colunas.push({
      id: `materia-${materia.id}`,
      header: materia.nome,
      width: LARGURA_DA_COLUNA_DE_MATERIA,
      align: "right",
      hideBelow: "md",
      cell: (l) => (
        <CelulaDeMateria
          linha={l}
          materia={materia}
          desvio={desvios.get(materia.id)}
        />
      ),
      /*
        ⚠️ Ordena pelo número, e quem não tem a matéria vai para o fim como
        nulo — junto com quem não teve leitura. O `sortRows` já manda nulo para
        o fim nas duas direções.
      */
      sortValue: (l) =>
        leituraVale(l) ? notaNaMateria(l, materia.id) ?? null : null,
    });
  }

  return colunas;
}
