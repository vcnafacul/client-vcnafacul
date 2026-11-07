import { StatusEnum } from "@/enums/generic/statusEnum";

/** As "Revisões necessárias" (relatos do Localiza) — mesmos nomes da api. */
export const REVISOES_DO_GEO = [
  { campo: "reportAddress", rotulo: "Endereço" },
  { campo: "reportContact", rotulo: "Contato" },
  { campo: "reportOther", rotulo: "Outro" },
] as const;
export type RevisaoDoGeo = (typeof REVISOES_DO_GEO)[number]["campo"];

/** O `tipo` da api: 0 cursinho, 1 universidade ("" = todos). */
export const TIPO_CURSINHO = "0";
export const TIPO_UNIVERSIDADE = "1";

export interface FiltrosDoGeo {
  /** Nome, sigla ou campus. */
  texto: string;
  /** E-mail do cursinho ou de quem cadastrou. */
  email: string;
  status: StatusEnum;
  tipo: "" | typeof TIPO_CURSINHO | typeof TIPO_UNIVERSIDADE;
  uf: string;
  cidade: string;
  /** Tipo de cursinho (Gratuito, Sem fins lucrativos, Outros). */
  categoria: string;
  /** Qualquer uma das marcadas. */
  revisoes: RevisaoDoGeo[];
}

/** O padrão continua sendo a fila de pendentes. */
export const FILTROS_VAZIOS: FiltrosDoGeo = {
  texto: "",
  email: "",
  status: StatusEnum.Pending,
  tipo: "",
  uf: "",
  cidade: "",
  categoria: "",
  revisoes: [],
};

/** Quantos filtros saíram do padrão (para o "Limpar filtros (N)"). */
export function contarFiltros(f: FiltrosDoGeo): number {
  return [
    f.texto.trim(),
    f.email.trim(),
    f.status !== StatusEnum.Pending,
    f.tipo,
    f.uf,
    f.cidade.trim(),
    f.categoria,
    f.revisoes.length > 0,
  ].filter(Boolean).length;
}

/** Os parâmetros do `GET /geo`; filtro vazio não vai. */
export function paraQuery(f: FiltrosDoGeo): Record<string, string> {
  const query: Record<string, string> = { status: String(f.status) };
  const add = (chave: string, valor: string) => {
    if (valor.trim()) query[chave] = valor.trim();
  };
  add("text", f.texto);
  add("email", f.email);
  add("type", f.tipo);
  add("state", f.uf);
  add("city", f.cidade);
  add("category", f.categoria);
  add("revisoes", f.revisoes.join(","));
  return query;
}
