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
      sortValue: (l) => statusDaLinha(l).label,
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
      id: "respondidas",
      header: "Respondidas",
      width: "8rem",
      align: "right",
      hideBelow: "md",
      // ⚠️ Mesmo gate da nota: numa refotografia que falhou este número é da
      // tentativa anterior, e afirmaria uma leitura que não houve.
      cell: (l) => (leituraVale(l) ? l.questoesRespondidas ?? VAZIO : VAZIO),
      sortValue: (l) =>
        leituraVale(l) ? l.questoesRespondidas ?? null : null,
    },
    {
      id: "motivo",
      header: "Motivo",
      cell: (l) => (
        // ⚠️ Coluna própria, não texto dentro do badge: o pedido é que o
        // cursinho veja na linha do aluno que houve erro E qual foi. Truncar a
        // única informação acionável da linha derrota o propósito.
        <span className={cn("text-xs", dashV2.text.secondary)}>
          {l.falha?.descricao ?? ""}
        </span>
      ),
    },
  );

  return colunas;
}
