import { cn } from "@/lib/utils";
import { ROTULO_DA_SECAO, type SecaoDoPerfil } from "./secoes";

type Props = {
  secoes: SecaoDoPerfil[];
  atual: SecaoDoPerfil;
  onEscolher: (s: SecaoDoPerfil) => void;
  /** Foto pequena, nome e função — sempre visíveis. */
  identidade: React.ReactNode;
  /** Dados não salvos na seção de dados: ponto no item. */
  dadosSujos?: boolean;
};

/**
 * Menu do Meu perfil: lateral a partir de `sm` (768 px), faixa de abas
 * roláveis e grudada no topo abaixo disso (sem gaveta escondida).
 */
export function MenuDoPerfil({
  secoes,
  atual,
  onEscolher,
  identidade,
  dadosSujos,
}: Props) {
  const item = (s: SecaoDoPerfil, celular: boolean) => {
    const ativo = s === atual;
    return (
      <button
        key={s}
        type="button"
        role="tab"
        aria-selected={ativo}
        aria-controls={`secao-${s}`}
        id={`aba-${s}${celular ? "-celular" : ""}`}
        onClick={() => onEscolher(s)}
        className={cn(
          "relative flex items-center gap-2 whitespace-nowrap text-sm transition-colors",
          celular
            ? "rounded-full px-3 py-1.5"
            : "w-full rounded-md py-2 pl-4 pr-3 text-left",
          ativo
            ? "bg-marine/[0.06] font-semibold text-marine"
            : "text-slate-600 hover:bg-slate-100 hover:text-marine",
        )}
      >
        {!celular && ativo && (
          <span
            aria-hidden
            className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-orange"
          />
        )}
        {ROTULO_DA_SECAO[s]}
        {s === "dados" && dadosSujos && (
          <span
            aria-label="alterações não salvas"
            className="h-2 w-2 rounded-full bg-orange"
          />
        )}
      </button>
    );
  };

  return (
    <>
      {/* celular: identidade numa linha + abas roláveis grudadas */}
      <div className="sticky top-0 z-10 -mx-4 border-b border-slate-200 bg-white px-4 pb-2 pt-3 sm:hidden">
        {identidade}
        <div
          role="tablist"
          aria-label="Seções do perfil"
          className="mt-2 flex gap-1 overflow-x-auto"
        >
          {secoes.map((s) => item(s, true))}
        </div>
      </div>
      {/* a partir de sm: menu lateral */}
      <aside className="hidden w-[220px] shrink-0 sm:block">
        <div className="sticky top-4 flex flex-col gap-4">
          {identidade}
          <nav>
            <div
              role="tablist"
              aria-label="Seções do perfil"
              aria-orientation="vertical"
              className="flex flex-col gap-1"
            >
              {secoes.map((s) => item(s, false))}
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
