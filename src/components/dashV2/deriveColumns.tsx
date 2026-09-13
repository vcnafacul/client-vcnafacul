import type { CardDash } from "@/components/molecules/cardDash";
import { StatusContent } from "@/enums/content/statusContent";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { StatusBadge } from "./StatusBadge";
import type { StatusV2 } from "./tokens";
import type { DashColumn } from "./types";

/**
 * Fallback de colunas a partir do `cardTransformation` que a tela **já tem**.
 *
 * ⚠️ **É o que torna a migração um `import`.** Sem isto, trocar
 * `DashCardTemplate` por `DashListTemplate` exigiria escrever um array de
 * colunas antes de ver qualquer pixel — e ninguém migra nove telas assim. Com
 * isto, a tela sobe no V2 e só então se decide se vale escrever as colunas de
 * verdade.
 *
 * ⚠️ **Degradado de propósito.** Formatação, largura e rótulo saem genéricos: o
 * `cardTransformation` devolve `string` já formatada e não diz nada sobre tipo,
 * unidade ou importância. O fallback não tenta adivinhar — ele mostra.
 *
 * ⚠️ **`.tsx` e não `.ts`** (o ticket escreveu `.ts`): duas células devolvem
 * JSX — o avatar da coluna 1 e o `StatusBadge`. Em `createElement` o arquivo
 * fica ilegível para economizar uma letra na extensão.
 */

/**
 * ⚠️ A amostra é das 10 primeiras entidades, não da primeira. Cards do mesmo
 * tipo nem sempre têm os mesmos `infos` — `dashContent` omite campos quando o
 * conteúdo não tem vídeo — e derivar da primeira entidade produziria uma tabela
 * que perde coluna dependendo de quem veio primeiro do servidor.
 */
export const TAMANHO_DA_AMOSTRA = 10;

/**
 * ⚠️ Só dígitos, com um separador decimal opcional. **Não** casa `"1.234"` como
 * milhar, `"-3"`, `"2019/2"` nem `"12 questões"` — e é de propósito: na dúvida
 * a coluna é texto, que ordena de forma estranha mas nunca mente sobre a
 * grandeza. Ordenar `"2019/2"` como o número 2019 é pior.
 */
export const RE_NUMERICA = /^\d+([.,]\d+)?$/;

const TONE_POR_STATUS: Partial<Record<number, StatusV2>> = {
  [StatusEnum.Approved]: "done",
  [StatusEnum.Pending]: "running",
  [StatusEnum.Rejected]: "missing",
  [StatusContent.Pending_Upload]: "running",
};

/**
 * ⚠️ O rótulo é obrigatório no `StatusBadge` e é ele que carrega o significado —
 * a cor do ponto é reforço. Ver a medição de contraste no `tokens.ts`.
 */
const ROTULO_POR_STATUS: Partial<Record<number, string>> = {
  [StatusEnum.Approved]: "Aprovado",
  [StatusEnum.Pending]: "Pendente",
  [StatusEnum.Rejected]: "Rejeitado",
  [StatusContent.Pending_Upload]: "Aguardando upload",
};

export const ROTULO_STATUS_DESCONHECIDO = "Sem status";

/**
 * ⚠️ `StatusEnum.Pending` é `0`. Qualquer `||` aqui transformaria "Pendente" em
 * "Sem status" silenciosamente — daí o `??`.
 */
export function toneDeStatus(status: StatusContent | StatusEnum): StatusV2 {
  return TONE_POR_STATUS[status] ?? "neutral";
}

export function rotuloDeStatus(status: StatusContent | StatusEnum): string {
  return ROTULO_POR_STATUS[status] ?? ROTULO_STATUS_DESCONHECIDO;
}

function valorDoCampo(card: CardDash, campo: string): string {
  return card.infos?.find((info) => info.field === campo)?.value ?? "";
}

/**
 * Cabeçalho da coluna 1. ⚠️ Genérico porque o `CardDash` não nomeia o título —
 * a tela que quiser "Nome da prova" passa `columns`.
 */
export const CABECALHO_DA_COLUNA_PRIMARIA = "Nome";

export function deriveColumns<T>(
  entities: readonly T[],
  cardTransformation: (entity: T) => CardDash,
): DashColumn<T>[] {
  /**
   * ⚠️ `(e) => cardTransformation(e)` e não `.map(cardTransformation)`: o `map`
   * passa `(valor, índice, array)` e um `cardTransformation` com segundo
   * parâmetro receberia o índice sem querer.
   */
  const amostra = entities
    .slice(0, TAMANHO_DA_AMOSTRA)
    .map((entity) => cardTransformation(entity));

  // A ordem de `campos` é a ordem de primeira aparição — é a ordem que a tela
  // escolheu ao escrever o `cardTransformation`, e ela quer dizer algo.
  const campos: string[] = [];
  const valoresPorCampo = new Map<string, string[]>();

  for (const card of amostra) {
    for (const info of card.infos ?? []) {
      if (!valoresPorCampo.has(info.field)) {
        campos.push(info.field);
        valoresPorCampo.set(info.field, []);
      }
      // ⚠️ Vazio não entra na amostra de tipo. Um campo que é numérico em 9 das
      // 10 linhas e vazio na décima continua numérico — senão bastaria um
      // registro sem data para a coluna inteira virar texto.
      if (info.value) valoresPorCampo.get(info.field)!.push(info.value);
    }
  }

  const colunas: DashColumn<T>[] = [
    {
      id: "title",
      header: CABECALHO_DA_COLUNA_PRIMARIA,
      primary: true,
      cell: (row) => {
        const card = cardTransformation(row);
        if (!card.logo) return card.title;
        return (
          <span className="flex min-w-0 items-center gap-2">
            {/* `alt=""` porque o título vem logo ao lado: anunciar as duas
                coisas faria o leitor de tela repetir o nome. */}
            <img
              src={card.logo}
              alt=""
              className="h-6 w-6 shrink-0 rounded object-contain"
            />
            <span className="truncate">{card.title}</span>
          </span>
        );
      },
      sortValue: (row) => cardTransformation(row).title ?? null,
    },
  ];

  for (const campo of campos) {
    const valores = valoresPorCampo.get(campo)!;
    /**
     * ⚠️ **Todos** os valores da amostra, e pelo menos um. Uma coluna sem
     * nenhum valor na amostra é texto: `every` sobre array vazio é `true` e
     * classificaria como numérica uma coluna da qual não se sabe nada.
     */
    const numerica =
      valores.length > 0 && valores.every((v) => RE_NUMERICA.test(v.trim()));

    colunas.push({
      // ⚠️ Prefixo `info:` para um campo chamado "title" ou "status" não colidir
      // com as duas colunas fixas.
      id: `info:${campo}`,
      // `"Cadastrado em "` (com o espaço) é literal em `dashProvas`.
      header: campo.trim().replace(/:$/, ""),
      align: numerica ? "right" : "left",
      cell: (row) => valorDoCampo(cardTransformation(row), campo),
      sortValue: (row) => {
        const bruto = valorDoCampo(cardTransformation(row), campo);
        if (bruto === "") return null;
        if (!numerica) return bruto;
        const n = Number(bruto.trim().replace(",", "."));
        // ⚠️ Fora da amostra pode aparecer valor não numérico numa coluna
        // classificada como numérica. `NaN` no comparador embaralha a lista
        // inteira (`a - b` é `NaN` e o `sort` fica indefinido); `null` vai para
        // o fim, que é o comportamento correto de "não tem valor comparável".
        return Number.isNaN(n) ? null : n;
      },
    });
  }

  colunas.push({
    id: "status",
    header: "Status",
    width: "168px",
    cell: (row) => {
      const status = cardTransformation(row).status;
      return (
        <StatusBadge tone={toneDeStatus(status)} label={rotuloDeStatus(status)} />
      );
    },
    // Ordena pelo rótulo, não pelo número do enum: a ordem de `StatusEnum`
    // (Pending=0, Approved=1, Rejected=2) não significa nada para quem lê.
    sortValue: (row) => rotuloDeStatus(cardTransformation(row).status),
  });

  return colunas;
}
