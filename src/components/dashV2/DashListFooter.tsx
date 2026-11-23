import { PaginationControls } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { intervaloDaPagina, totalDePaginas } from "./paginacao";

export interface DashListFooterProps {
  /** 1-based. */
  pagina: number;
  pageSize: number;
  /** Total de registros **do conjunto inteiro**, não da página. */
  total: number;
  onPageChange: (pagina: number) => void;
}

/**
 * Rodapé da listagem: contagem à esquerda, paginação à direita.
 *
 * ⚠️ O intervalo em si é conta pura e mora no `paginacao.ts` — o template
 * precisa do `totalDePaginas` também, e duas cópias da conta divergiriam.
 *
 * ⚠️ **Paginação numerada, e não scroll infinito** — mudança consciente em
 * relação ao V1. Numa tela administrativa procura-se um registro específico e
 * comparam-se linhas; "estou na página 3" é informação, e o scroll infinito do
 * V1 (janela deslizante de 4 páginas com `entities.slice`) não só impede dizer
 * isso como é a origem do bug `08`.
 *
 * ⚠️ Some inteiro quando não há nenhum registro: com a tabela mostrando o
 * estado vazio, "Mostrando 0–0 de 0" é ruído sobre uma informação que a
 * mensagem de vazio já deu.
 *
 * ⚠️ A paginação é o `PaginationControls` do `components/ui/pagination` (a mesma
 * de todas as telas: "Anterior" e "Próxima" são `disabled` de verdade nas pontas).
 * Com uma página só, a lista curta fica só com a contagem.
 */
export function DashListFooter({
  pagina,
  pageSize,
  total,
  onPageChange,
}: DashListFooterProps) {
  if (total === 0) return null;

  const { inicio, fim } = intervaloDaPagina(pagina, pageSize, total);

  return (
    <div
      data-testid="dash-list-footer"
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t px-4 py-2",
        "border-border bg-card",
      )}
    >
      {/*
        ⚠️ `aria-live`: quem navega por teclado troca de página sem que nada
        mude no foco. Sem o anúncio, a única pista de que a lista mudou é
        visual.
      */}
      <p
        aria-live="polite"
        className="text-body text-muted-foreground"
      >
        Mostrando {inicio}–{fim} de {total}
      </p>

      <PaginationControls
        page={pagina}
        totalPages={totalDePaginas(total, pageSize)}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export default DashListFooter;
