import { Inbox } from "lucide-react";
import { TABLE_SKELETON_ROWS, TableSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

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
export const LINHAS_SKELETON = TABLE_SKELETON_ROWS;

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
      <p className="text-body text-muted-foreground">{TEXTO_ERRO}</p>
      {onRetry ? (
        <Button type="button" variant="ghost" onClick={onRetry} className="text-foreground">
          {TEXTO_TENTAR_DE_NOVO}
        </Button>
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
      <Inbox aria-hidden="true" className="h-8 w-8 text-muted-foreground" />
      <p className="text-body font-medium text-foreground">{TEXTO_VAZIO}</p>
      <p className="text-caption text-muted-foreground">{DICA_VAZIO}</p>
    </div>
  );
}

/**
 * Linhas de skeleton com **as mesmas colunas** da tabela.
 *
 * ⚠️ Moraram aqui; agora são o `TableSkeleton` do `components/ui/skeleton`
 * (tickets/059 §3). Os nomes ficam até a Task 11.
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
    <TableSkeleton
      columns={colunas}
      rows={linhas}
      rowClassName={alturaLinha}
      cellClassName={classeDeCelula}
    />
  );
}

/** Skeleton da lista empilhada — sem tabela, então sem `<tr>`. */
export function BlocosSkeleton({ blocos = LINHAS_SKELETON }: { blocos?: number }) {
  return <TableSkeleton layout="cards" rows={blocos} />;
}
