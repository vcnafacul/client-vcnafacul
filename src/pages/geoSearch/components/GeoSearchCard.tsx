import type { PublicGeolocation } from "@/types/geolocation/publicGeolocation";
import { forwardRef, type ReactNode } from "react";
import { atualizadoEm, formatarData } from "../regras";

type Props = {
  geo: PublicGeolocation;
  ativo: boolean;
  onFoco: (id: string | null) => void;
  onEscolher: (id: string) => void;
  /** Botão "informação correta" (card 09), no canto superior direito. */
  acao?: ReactNode;
};

/**
 * Card de um cursinho na lista. O botão principal cobre o card; o canto
 * superior direito fica reservado para o "informação correta" (card 09), que
 * será outro botão — por isso não é o card inteiro que é um `<button>`.
 */
export const GeoSearchCard = forwardRef<HTMLElement, Props>(
  function GeoSearchCard({ geo, ativo, onFoco, onEscolher, acao }, ref) {
    return (
      <article
        ref={ref}
        data-geo-id={geo.id}
        className={`relative rounded-2xl border bg-white p-4 shadow-sm transition ${
          ativo ? "border-orange ring-2 ring-orange/40" : "border-slate-200"
        }`}
      >
        <button
          type="button"
          onClick={() => onEscolher(geo.id)}
          onMouseEnter={() => onFoco(geo.id)}
          onMouseLeave={() => onFoco(null)}
          onFocus={() => onFoco(geo.id)}
          onBlur={() => onFoco(null)}
          className="flex w-full flex-col gap-2 pr-10 text-left focus:outline-none"
        >
          <h3 className="line-clamp-2 font-bold text-marine" title={geo.name}>
            {geo.name}
          </h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-sm text-slate-600">
            <dt className="text-slate-400">Estado</dt>
            <dd>{geo.state}</dd>
            <dt className="text-slate-400">Cidade</dt>
            <dd>{geo.city}</dd>
            <dt className="text-slate-400">Cadastro</dt>
            <dd>{formatarData(geo.createdAt)}</dd>
            {geo.infoUpdatedAt && (
              <>
                <dt className="text-slate-400">Atualizado</dt>
                <dd>{formatarData(atualizadoEm(geo))}</dd>
              </>
            )}
          </dl>
        </button>
        <div data-slot="confirmacao" className="absolute right-3 top-3">
          {acao}
        </div>
      </article>
    );
  },
);
