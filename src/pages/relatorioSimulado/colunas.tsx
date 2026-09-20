import { dashV2, StatusBadge, type DashColumn } from "@/components/dashV2";
import type { LinhaDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
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
}: {
  /** `true` quando o recorte já é de uma turma — aí a coluna Turma some. */
  comTurma: boolean;
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
      id: "status",
      header: "Status",
      width: "11rem",
      cell: (l) => {
        const { tone, label } = statusDaLinha(l);
        return <StatusBadge tone={tone} label={label} />;
      },
      // ⚠️ Pelo `ordem`, não pelo `label`: alfabético daria "Aguardando" <
      // "Falhou" < "Lido" < "Não enviou", que não é ordem de trabalho nenhuma.
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
    {
      id: "cartao",
      header: "Cartão",
      width: "7rem",
      align: "right",
      hideBelow: "md",
      /**
       * ⚠️ **Fora do gate de leitura, de propósito.** `cartaoCode` é escrito do
       * QR da folha no `createAwaitingOmr`: é a IDENTIDADE do cartão físico, não
       * um RESULTADO da leitura. Numa linha que falhou é a coisa mais útil que
       * existe — diz qual folha refotografar.
       */
      cell: (l) => l.cartaoCode ?? VAZIO,
      sortValue: (l) => l.cartaoCode ?? null,
    },
    {
      id: "motivo",
      header: "Motivo",
      /**
       * ⚠️ Coluna própria, não texto dentro do badge: o pedido é que o cursinho
       * veja na linha do aluno que houve erro E qual foi. Truncar a única
       * informação acionável da linha derrota o propósito.
       *
       * ⚠️ **String crua, não `<span>`** — é o que faz o `DashTable` conseguir
       * pôr o `title` na célula (o `tituloDe` dele só sabe titular texto). Sem
       * isso o motivo trunca em ~245px e não há como ler o resto.
       *
       * ⚠️ E **gateado em `failed`**: nada desfaz a `falha` no ms — ver
       * `leituraVale`.
       */
      cell: (l) => (l.status === "failed" ? l.falha?.descricao ?? "" : ""),
    },
  );

  return colunas;
}
