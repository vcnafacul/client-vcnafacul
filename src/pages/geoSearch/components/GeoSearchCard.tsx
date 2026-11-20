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
        className={`relative h-full rounded-xl border bg-white p-3 shadow-sm transition ${
          ativo ? "border-cta ring-2 ring-primary" : "border-border"
        }`}
      >
        <button
          type="button"
          onClick={() => onEscolher(geo.id)}
          onMouseEnter={() => onFoco(geo.id)}
          onMouseLeave={() => onFoco(null)}
          onFocus={() => onFoco(geo.id)}
          onBlur={() => onFoco(null)}
          className="flex h-full w-full flex-col gap-1.5 pr-10 text-left focus:outline-none"
        >
          {/*
            Reserva as 2 linhas do título em todo card: nome curto e nome longo
            ficam com a mesma altura, e a grade não fica desencontrada.
          */}
          <h3
            className="line-clamp-2 min-h-12 font-bold text-foreground"
            title={geo.name}
          >
            {geo.name}
          </h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-2 text-body text-muted-foreground">
            <dt className="text-muted-foreground">Estado</dt>
            <dd>{geo.state}</dd>
            <dt className="text-muted-foreground">Cidade</dt>
            <dd>{geo.city}</dd>
            <dt className="text-muted-foreground">Cadastro</dt>
            <dd>{formatarData(geo.createdAt)}</dd>
            {geo.infoUpdatedAt && (
              <>
                <dt className="text-muted-foreground">Atualizado</dt>
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
