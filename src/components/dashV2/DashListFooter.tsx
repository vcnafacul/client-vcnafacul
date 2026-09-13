import { PaginationWrapper } from "@/components/organisms/paginationWrapper";
import { cn } from "@/lib/utils";
import { intervaloDaPagina, totalDePaginas } from "./paginacao";
import { dashV2 } from "./tokens";

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
 * ⚠️ **Reusa o `PaginationWrapper`**, que já embrulha o `components/ui/
 * pagination` com elipse e prev/next — reimplementar aqui seria uma terceira
 * cópia da mesma lógica no projeto. Ele devolve `null` sozinho com uma página
 * só, então uma lista curta fica só com a contagem. Os `[&_nav]:` são
 * seletores de descendente (especificidade maior que a da classe do próprio
 * `nav`) e é assim que o `my-6`/`w-full` de lá são neutralizados **sem** tocar
 * num arquivo compartilhado por outras duas telas.
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
        "[&_nav]:mx-0 [&_nav]:my-0 [&_nav]:w-auto",
        dashV2.surface,
        dashV2.border,
      )}
    >
      {/*
        ⚠️ `aria-live`: quem navega por teclado troca de página sem que nada
        mude no foco. Sem o anúncio, a única pista de que a lista mudou é
        visual.
      */}
      <p
        aria-live="polite"
        className={cn("text-sm", dashV2.text.secondary)}
      >
        Mostrando {inicio}–{fim} de {total}
      </p>

      <PaginationWrapper
        currentPage={pagina}
        totalPages={totalDePaginas(total, pageSize)}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export default DashListFooter;
