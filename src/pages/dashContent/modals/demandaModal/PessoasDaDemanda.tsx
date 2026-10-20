import { formatDate } from "@/utils/date";
import { iniciais } from "./helpers";

export interface PessoaDaDemanda {
  /** "Criada por", "Material de", "Aprovada por"… */
  papel: string;
  /** Nome resolvido pela api; quando falta, o id ainda identifica. */
  nome?: string;
  id?: string;
  /** ISO. */
  em?: string;
}

/**
 * Quem fez o quê na demanda (tickets/050): criadora, autora do material,
 * aprovador — cada um com iniciais num círculo, nome e data. Sem foto nesta
 * série (D6). Papel sem pessoa não aparece.
 */
export function PessoasDaDemanda({ pessoas }: { pessoas: PessoaDaDemanda[] }) {
  const visiveis = pessoas.filter((p) => p.nome || p.id);
  if (!visiveis.length) return null;
  return (
    <ul
      className="flex flex-wrap gap-x-5 gap-y-2"
      aria-label="Pessoas da demanda"
    >
      {visiveis.map((p) => {
        const nome = p.nome || p.id || "";
        return (
          <li key={p.papel} className="flex items-center gap-2 min-w-0">
            <span
              aria-hidden
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-marine/10 text-[11px] font-bold text-marine"
            >
              {iniciais(p.nome || p.id)}
            </span>
            <span className="text-xs text-muted-foreground leading-tight min-w-0">
              <span className="block">{p.papel}</span>
              <span className="block font-medium text-foreground truncate">
                {nome}
                {p.em && (
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    · {formatDate(p.em)}
                  </span>
                )}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
