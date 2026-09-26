import { Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { dashV2 } from "./tokens";

/**
 * Estados da `DashTable` — vazio, erro e carregando.
 *
 * ⚠️ São blocos **sem markup de tabela** (fora o skeleton, que precisa de
 * `<tr>`): a mesma mensagem serve para a tabela e para a lista empilhada do
 * mobile, e duas versões do mesmo texto é como elas começariam a divergir.
 */

export const TEXTO_ERRO = "Erro ao carregar";
export const TEXTO_TENTAR_DE_NOVO = "Tentar novamente";
export const TEXTO_VAZIO = "Nenhum registro encontrado";
export const DICA_VAZIO = "Tente limpar os filtros ou buscar por outro termo.";

/** 8 linhas: o suficiente para ocupar a dobra sem virar uma parede pulsando. */
export const LINHAS_SKELETON = 8;

/**
 * ⚠️ Faixa, e não modal nem toast: o erro pertence à lista que falhou, e o
 * botão de retentar precisa estar do lado dele. Mesmo padrão do `Panel`
 * do `pages/dashboard`.
 */
export function DashTableErro({ onRetry }: { onRetry?: () => void }) {
  return (
    <div
      role="alert"
      data-testid="dash-table-erro"
      className="flex flex-col items-center gap-2 px-4 py-8 text-center"
    >
      <p className={cn("text-sm", dashV2.text.secondary)}>{TEXTO_ERRO}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            "rounded-sm text-sm font-medium underline-offset-2 hover:underline",
            dashV2.text.primary,
            dashV2.focus,
          )}
        >
          {TEXTO_TENTAR_DE_NOVO}
        </button>
      ) : null}
    </div>
  );
}

/**
 * O vazio default.
 *
 * ⚠️ A dica fala de filtro porque é o caso comum, mas quem sabe se há filtro
 * ativo é a tela: ela passa um `emptyState` próprio quando o vazio é "não
 * existe nenhum registro ainda", que é outra mensagem e outra ação.
 */
export function DashTableVazio() {
  return (
    <div
      data-testid="dash-table-vazio"
      className="flex flex-col items-center gap-2 px-4 py-10 text-center"
    >
      <Inbox aria-hidden="true" className={cn("h-8 w-8", dashV2.text.muted)} />
      <p className={cn("text-sm font-medium", dashV2.text.primary)}>{TEXTO_VAZIO}</p>
      <p className={cn("text-xs", dashV2.text.secondary)}>{DICA_VAZIO}</p>
    </div>
  );
}

/**
 * Linhas de skeleton com **as mesmas colunas** da tabela.
 *
 * ⚠️ Não é um spinner centralizado de propósito: a largura das colunas é fixada
 * pelo `<th>`, então o skeleton já ocupa exatamente o lugar dos dados e nada
 * salta quando eles chegam.
 */
export function LinhasSkeleton({
  colunas,
  alturaLinha,
  classeDeCelula,
  linhas = LINHAS_SKELETON,
}: {
  /** Uma classe de visibilidade por coluna, na ordem — mantém o `hideBelow`. */
  colunas: string[];
  alturaLinha: string;
  classeDeCelula: string;
  linhas?: number;
}) {
  return (
    <>
      {Array.from({ length: linhas }, (_, i) => (
        <tr key={i} data-testid="dash-table-skeleton-row" className={alturaLinha}>
          {colunas.map((visibilidade, j) => (
            <td key={j} className={cn(classeDeCelula, visibilidade)}>
              <Skeleton className="h-3.5 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Skeleton da lista empilhada — sem tabela, então sem `<tr>`. */
export function BlocosSkeleton({ blocos = LINHAS_SKELETON }: { blocos?: number }) {
  return (
    <>
      {Array.from({ length: blocos }, (_, i) => (
        <div
          key={i}
          data-testid="dash-table-skeleton-row"
          className={cn("space-y-2 border-b px-4 py-3", dashV2.border)}
        >
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </>
  );
}
