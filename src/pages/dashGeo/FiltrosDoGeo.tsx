import { dashV2 } from "@/components/dashV2";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { cn } from "@/lib/utils";
import { courseType } from "@/pages/Geo/data";
import { stateOptions } from "@/pages/register/data";
import { useEffect, useState } from "react";
import { dashGeo } from "./data";
import {
  contarFiltros,
  FiltrosDoGeo as Filtros,
  REVISOES_DO_GEO,
  RevisaoDoGeo,
  TIPO_CURSINHO,
  TIPO_UNIVERSIDADE,
} from "./filtros";

interface Props {
  valor: Filtros;
  onChange: (filtros: Filtros) => void;
}

/** Quanto o texto espera antes de buscar: cada busca baixa a lista inteira. */
const ESPERA_DO_TEXTO = 400;

const campo = cn(
  "h-9 w-full rounded-md border px-2 text-sm",
  dashV2.border,
  dashV2.surface,
  dashV2.text.primary,
  dashV2.focus,
);

function Rotulo({ htmlFor, children }: { htmlFor?: string; children: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("text-xs font-medium", dashV2.text.secondary)}
    >
      {children}
    </label>
  );
}

/** Campo de texto que só avisa depois de a pessoa parar de digitar. */
function Texto({
  id,
  rotulo,
  placeholder,
  valor,
  onChange,
}: {
  id: string;
  rotulo: string;
  placeholder: string;
  valor: string;
  onChange: (valor: string) => void;
}) {
  const [rascunho, setRascunho] = useState(valor);

  // "Limpar filtros" troca o valor de fora: o rascunho acompanha.
  useEffect(() => setRascunho(valor), [valor]);

  useEffect(() => {
    if (rascunho === valor) return;
    const espera = setTimeout(() => onChange(rascunho), ESPERA_DO_TEXTO);
    return () => clearTimeout(espera);
  }, [rascunho, valor, onChange]);

  return (
    <div className="flex flex-col gap-1">
      <Rotulo htmlFor={id}>{rotulo}</Rotulo>
      <input
        id={id}
        type="search"
        value={rascunho}
        placeholder={placeholder}
        onChange={(e) => setRascunho(e.target.value)}
        className={campo}
      />
    </div>
  );
}

/**
 * Os filtros da Validação LC (mesma ideia do banco de questões): um campo por
 * coisa, em vez de uma busca que procurava a mesma palavra em tudo.
 */
export function FiltrosDoGeo({ valor, onChange }: Props) {
  const mudar = <K extends keyof Filtros>(chave: K, novo: Filtros[K]) => {
    const proximo = { ...valor, [chave]: novo };
    // Tipo de cursinho não existe para universidade.
    if (chave === "tipo" && novo === TIPO_UNIVERSIDADE) proximo.categoria = "";
    onChange(proximo);
  };

  const [aberto, setAberto] = useState(false);
  const outrosAtivos = contarFiltros(valor) - (valor.texto.trim() ? 1 : 0);

  const alternarRevisao = (revisao: RevisaoDoGeo, marcada: boolean) =>
    mudar(
      "revisoes",
      marcada
        ? [...valor.revisoes, revisao]
        : valor.revisoes.filter((r) => r !== revisao),
    );

  return (
    <div className="grid w-full basis-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
      <div className="sm:col-span-2">
        <Texto
          id="filtro-geo-texto"
          rotulo="Buscar"
          placeholder="Nome, sigla ou campus"
          valor={valor.texto}
          onChange={(texto) => mudar("texto", texto)}
        />
      </div>
      {/* No celular os outros filtros ocupavam a primeira tela inteira. */}
      <button
        type="button"
        aria-expanded={aberto}
        onClick={() => setAberto(!aberto)}
        className={cn(
          "h-9 rounded-md border px-3 text-sm sm:hidden",
          dashV2.border,
          dashV2.text.primary,
          dashV2.focus,
        )}
      >
        {aberto ? "Menos filtros" : "Mais filtros"}
        {outrosAtivos > 0 ? ` (${outrosAtivos})` : ""}
      </button>
      <div className={cn(aberto ? "contents" : "hidden", "sm:contents")}>
        <Texto
          id="filtro-geo-email"
          rotulo="E-mail"
          placeholder="Do cursinho ou de quem cadastrou"
          valor={valor.email}
          onChange={(email) => mudar("email", email)}
        />
        <div className="flex flex-col gap-1">
          <Rotulo htmlFor="filtro-geo-status">Status</Rotulo>
          <select
            id="filtro-geo-status"
            value={String(valor.status)}
            onChange={(e) =>
              mudar("status", Number(e.target.value) as StatusEnum)
            }
            className={campo}
          >
            {dashGeo.options.map((o) => (
              <option key={o.id} value={String(o.id)}>
                {o.name}
              </option>
            ))}
            <option value={String(StatusEnum.All)}>Todos</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Rotulo htmlFor="filtro-geo-tipo">Tipo</Rotulo>
          <select
            id="filtro-geo-tipo"
            value={valor.tipo}
            onChange={(e) => mudar("tipo", e.target.value as Filtros["tipo"])}
            className={campo}
          >
            <option value="">Todos</option>
            <option value={TIPO_CURSINHO}>Cursinho</option>
            <option value={TIPO_UNIVERSIDADE}>Universidade</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Rotulo htmlFor="filtro-geo-categoria">Tipo de cursinho</Rotulo>
          <select
            id="filtro-geo-categoria"
            value={valor.categoria}
            disabled={valor.tipo === TIPO_UNIVERSIDADE}
            onChange={(e) => mudar("categoria", e.target.value)}
            className={cn(campo, "disabled:opacity-50")}
          >
            <option value="">Todos</option>
            {courseType.map((o) => (
              <option key={String(o.value)} value={String(o.value)}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Rotulo htmlFor="filtro-geo-uf">Estado</Rotulo>
          <select
            id="filtro-geo-uf"
            value={valor.uf}
            onChange={(e) => mudar("uf", e.target.value)}
            className={campo}
          >
            <option value="">Todos</option>
            {stateOptions.map((o) => (
              <option key={String(o.value)} value={String(o.value)}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <Texto
          id="filtro-geo-cidade"
          rotulo="Cidade"
          placeholder="Ex.: Campinas"
          valor={valor.cidade}
          onChange={(cidade) => mudar("cidade", cidade)}
        />
        <fieldset className="flex flex-col gap-1 sm:col-span-2 md:col-span-4">
          <legend
            className={cn("mb-1 text-xs font-medium", dashV2.text.secondary)}
          >
            Revisões necessárias (qualquer uma)
          </legend>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {REVISOES_DO_GEO.map((r) => (
              <label
                key={r.campo}
                className={cn(
                  "flex items-center gap-2 text-sm",
                  dashV2.text.primary,
                )}
              >
                <input
                  type="checkbox"
                  checked={valor.revisoes.includes(r.campo)}
                  onChange={(e) => alternarRevisao(r.campo, e.target.checked)}
                />
                {r.rotulo}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
