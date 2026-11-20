import { Search, X } from "lucide-react";
import { forwardRef } from "react";

export const ID_DA_BUSCA = "busca-cursinhos";

type Props = { valor: string; onMudar: (v: string) => void };

/**
 * Campo "Pesquisar cursinhos…" sobre o mapa (card 06). `Esc` e o ✕ limpam.
 * O `id` é o alvo do "Voltar e buscar de novo" do modal (card 08).
 */
export const BuscaCursinhos = forwardRef<HTMLInputElement, Props>(
  function BuscaCursinhos({ valor, onMudar }, ref) {
    return (
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
        />
        <input
          ref={ref}
          id={ID_DA_BUSCA}
          type="search"
          aria-label="Pesquisar cursinhos"
          placeholder="Pesquisar cursinhos…"
          value={valor}
          onChange={(e) => onMudar(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onMudar("");
          }}
          className="w-full rounded-full border border-border bg-white py-3 pl-12 pr-12 text-foreground shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-search-cancel-button]:hidden"
        />
        {valor && (
          <button
            type="button"
            aria-label="Limpar busca"
            onClick={() => onMudar("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        )}
      </div>
    );
  },
);
